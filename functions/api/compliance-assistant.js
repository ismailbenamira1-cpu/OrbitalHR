import { reply, preflight, callAI, friendlyError } from '../_shared/ai.js';

const MAX_QUERY = 1000;
const MAX_ROSTER = 60;
const MAX_HISTORY = 8;

export async function onRequest({ request, env }) {
  const pre = preflight(request);
  if (pre) return pre;
  if (request.method !== 'POST') return reply({ success: false, error: 'Method not allowed' }, 405);

  try {
    const body = await request.json();
    const query = String(body.query || '').trim().slice(0, MAX_QUERY);
    if (!query) return reply({ success: false, error: 'Please type a question.' });

    const roster = (Array.isArray(body.roster) ? body.roster : []).slice(0, MAX_ROSTER);
    const rosterSummary = roster
      .map(
        (e) =>
          `- ${String(e.name).slice(0, 80)} | home: ${e.homeCountry} | host: ${e.hostRegion} | role: ${e.role} | days used: ${e.daysUsed} of ${e.visaLimitDays} allowed | days to nearest limit: ${e.minDaysToCliff} | PE/tax risk: ${e.peRisk} | social security form: ${e.ssInfo?.form} | recommended action: ${e.recommendation} | annual savings vs EOR (USD): ${e.annualSavingsVsEor}`
      )
      .join('\n');

    const system = `You are OrbitalCopilot, a cross-border HR and tax compliance assistant inside the Orbital HR platform. Users are CFOs and heads of HR at US and Canadian companies with employees working abroad.

ROSTER (the only company data you can see):
${rosterSummary || 'No employees loaded.'}

Rules:
- Answer from the roster data above. If something is not in it, say so instead of guessing.
- General rules (visa stay limits, treaties, PE, EOR graduation) can change. Say when a point should be verified with a tax adviser or immigration lawyer.
- You give guidance, not legal or tax advice. Never invent employees, numbers, forms or laws.
- Be concise and practical. Use short paragraphs or a short list. Lead with the answer.`;

    const history = (Array.isArray(body.history) ? body.history : [])
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
    while (history.length && history[0].role !== 'user') history.shift();

    const answer = await callAI(env, {
      system,
      messages: [...history, { role: 'user', content: query }],
      maxTokens: 700,
      temperature: 0.3,
    });
    return reply({ success: true, answer });
  } catch (err) {
    console.error('compliance-assistant failed:', err.message);
    return reply({ success: false, error: friendlyError(err) });
  }
}
