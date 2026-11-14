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
