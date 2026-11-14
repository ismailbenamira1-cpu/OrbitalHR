import { reply, preflight, callAI, friendlyError } from '../_shared/ai.js';

export async function onRequest({ request, env }) {
  const pre = preflight(request);
  if (pre) return pre;
  if (request.method !== 'POST') return reply({ success: false, error: 'Method not allowed' }, 405);

  try {
    let employee = {};
    try {
      const body = await request.json();
      employee = body.employee || body || {};
    } catch (e) {}

    const s = (v, d) => String(v ?? d).slice(0, 120);
    const prompt = `Write an Executive AI Compliance Brief for this employee.
- Name: ${s(employee.name, 'Remote Employee')}
- Home country: ${s(employee.homeCountry, 'US')}
- Host: ${s(employee.hostRegion || employee.hostCountry, 'Unknown')}
- Days used: ${s(employee.daysUsed, 0)}
- Role: ${s(employee.role, 'Standard Remote')}
- PE risk level: ${s(employee.peRisk, 'Moderate')}
- Social security form: ${s(employee.ssInfo?.form, 'Check bilateral agreement')}

Use markdown with these sections:
1. Executive Summary and Tax Risk
2. Immigration and Day-Count Velocity
3. Social Security and Payroll Compliance
4. Recommended Action Items (3 bullets)
Keep it under 250 words. Note that rules should be verified with a tax adviser or immigration lawyer.`;

    const text = await callAI(env, {
      system: 'You are a cross-border HR and corporate tax compliance analyst for Orbital HR. Give guidance, not legal advice. Never invent facts beyond the data given.',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 800,
      temperature: 0.3,
    });
    return reply({ success: true, summary: text, brief: text });
  } catch (err) {
    console.error('employee-summary failed:', err.message);
    return reply({ success: false, error: friendlyError(err) });
  }
}
