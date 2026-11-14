export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let employee = {};
    try {
      const body = await request.json();
      employee = body.employee || body || {};
    } catch (e) {}

    const apiKey = env.GEMINI_API_KEY || env.API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Configuration Error: GEMINI_API_KEY is missing in Cloudflare Pages Environment Variables." 
      }), { status: 200, headers: corsHeaders });
    }

    const name = employee.name || employee.employeeName || 'Remote Employee';
    const home = employee.homeCountry || 'US';
    const host = employee.hostCountry || 'Canada';
    const days = employee.daysUsed || 45;
    const role = employee.role || 'Standard Remote';
    const peRisk = employee.peRisk || 'Moderate';
    const treaty = employee.ssInfo?.form || 'Bilateral Certificate Pending';

    const prompt = `You are an expert cross-border HR and corporate tax compliance analyst for OrbitalHR. 
Generate a professional Executive AI Compliance Brief for this employee:
- Name: ${name}
- Home Country: ${home}
- Host Country: ${host}
- Days Accrued: ${days} days
- Role: ${role}
- PE Risk Level: ${peRisk}
- Social Security Treaty: ${treaty}

Provide a structured markdown brief with:
1. Executive Summary & Tax Risk
2. Immigration & Day-Count Velocity
3. Social Security & Payroll Compliance
4. Recommended Action Items (3 bullet points)`;

    const modelsToTry = ['gemini-3.8-flash', 'gemini-1.5-flash'];
    let data = null;

    // Helper function for exponential backoff retry on 429 overload
    async function callGeminiWithRetry(model, payload, maxRetries = 3) {
      let delay = 1000;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          return await res.json();
        }

        // If rate limited (429) or overloaded (503), wait and retry
        if ((res.status === 429 || res.status === 503) && attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Double wait time each attempt (1s -> 2s -> 4s)
          continue;
        }

        break; // Non-retryable error
      }
      return null;
    }

    for (const model of modelsToTry) {
      data = await callGeminiWithRetry(model, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
      });

      if (data && data.candidates) {
        break; // Success!
      }
    }

    if (!data || !data.candidates) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "AI service is temporarily busy. Please click the button again." 
      }), { status: 200, headers: corsHeaders });
    }

    const text = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ 
      success: true, 
      summary: text, 
      brief: text 
    }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: err.message 
    }), { status: 200, headers: corsHeaders });
  }
}
