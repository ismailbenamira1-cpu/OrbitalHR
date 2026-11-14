export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
  }

  try {
    let employee = {};
    try {
      const body = await request.json();
      employee = body.employee || body || {};
    } catch (e) {}

    const apiKey = env.GEMINI_API_KEY || env.API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: 'GEMINI_API_KEY is missing in Cloudflare Pages Environment Variables.' }), { status: 200, headers: corsHeaders });
    }

    const prompt = `You are an expert cross-border HR and corporate tax compliance analyst for OrbitalHR. 
Generate a professional Executive AI Compliance Brief for this employee:
- Name: ${employee.name || 'Remote Employee'}
- Home Country: ${employee.homeCountry || 'US'}
- Host Country: ${employee.hostCountry || 'Canada'}
- Days Accrued: ${employee.daysUsed || 45} days
- Role: ${employee.role || 'Standard Remote'}
- PE Risk Level: ${employee.peRisk || 'Moderate'}
- Social Security Treaty: ${employee.ssInfo?.form || 'Bilateral Certificate Pending'}

Provide a structured markdown brief with:
1. Executive Summary & Tax Risk
2. Immigration & Day-Count Velocity
3. Social Security & Payroll Compliance
4. Recommended Action Items (3 bullet points)`;

    const modelsToTry = ['gemini-3.8-flash', 'gemini-1.5-pro'];
    let data = null;

    async function callWithRetry(model, payload) {
      let delay = 1000;
      for (let attempt = 0; attempt < 3; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            return await res.json();
          }

          // If overloaded (429 or 503), back off and retry
          if ((res.status === 429 || res.status === 503) && attempt < 2) {
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
            continue;
          }
        } catch (e) {
          clearTimeout(timeoutId);
        }
        break;
      }
      return null;
    }

    for (const model of modelsToTry) {
      data = await callWithRetry(model, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
      });
      if (data && data.candidates) break;
    }

    if (!data || !data.candidates) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'AI service is experiencing high demand. Please click the button again.' 
      }), { status: 200, headers: corsHeaders });
    }

    const text = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ success: true, summary: text, brief: text }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 200, headers: corsHeaders });
  }
}
