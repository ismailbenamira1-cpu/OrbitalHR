// Helpers (inlined so this file has no imports).
const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const reply = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: HEADERS });

const preflight = (request) =>
  request.method === 'OPTIONS' ? new Response(null, { status: 204, headers: HEADERS }) : null;

async function timedFetch(url, options, ms = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function callClaude(env, { system, messages, maxTokens, temperature }) {
  const body = JSON.stringify({
    model: env.CLAUDE_MODEL || 'claude-haiku-5-5',
    max_tokens: maxTokens,
    temperature,
    system,
    messages,
  });
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await timedFetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body,
    });
    if (res.ok) {
      const data = await res.json();
      const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
      if (text) return text;
      throw new Error('EMPTY');
    }
    if ((res.status === 429 || res.status === 529) && attempt === 0) {
      await new Promise((r) => setTimeout(r, 1500));
      continue;
    }
    console.error('Claude API error', res.status, await res.text());
    break;
  }
  throw new Error('UPSTREAM');
}

async function callGemini(env, { system, messages, maxTokens, temperature }) {
  const key = env.GEMINI_API_KEY || env.API_KEY;
  const models = env.GEMINI_MODEL ? [env.GEMINI_MODEL] : ['gemini-3.8-flash', 'gemini-1.5-pro'];
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  for (const model of models) {
    try {
      const res = await timedFetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents,
            generationConfig: { temperature, maxOutputTokens: maxTokens },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (e) {
      // try next model
    }
  }
  throw new Error('UPSTREAM');
}

// Uses Claude if ANTHROPIC_API_KEY is set, otherwise falls back to Gemini.
async function callAI(env, opts) {
  const o = { maxTokens: 700, temperature: 0.3, ...opts };
  if (env.ANTHROPIC_API_KEY) return callClaude(env, o);
  if (env.GEMINI_API_KEY || env.API_KEY) return callGemini(env, o);
  throw new Error('NO_KEY');
}

function friendlyError(err) {
  if (err.message === 'NO_KEY') return 'AI is not configured yet. Add ANTHROPIC_API_KEY in Cloudflare Pages settings.';
  return 'The AI copilot is busy right now. Please try again in a moment.';
}

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
