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
    } catch (e) {
      // Fallback if body is empty or malformed
    }

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

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
      })
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: data.error?.message || "Gemini API rejected request" 
      }), { status: 200, headers: corsHeaders });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Compliance review completed.";

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
