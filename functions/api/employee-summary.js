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
      employee = body.employee || {};
    } catch (e) {
      // Handle empty body gracefully
    }

    const apiKey = env.GEMINI_API_KEY || env.API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Configuration Error: GEMINI_API_KEY is missing in Cloudflare Pages Environment Variables." 
      }), { status: 200, headers: corsHeaders });
    }

    // Comprehensive, professional prompt for detailed compliance analysis
    const prompt = `You are an expert cross-border HR and corporate tax compliance analyst for OrbitalHR. 
Generate a comprehensive, professional Executive AI Compliance Brief for the following employee profile:
- Employee Name: ${employee.name || 'Remote Employee'}
- Home Country: ${employee.homeCountry || 'US'}
- Host Country: ${employee.hostCountry || 'Canada'}
- Days Accrued in Host Country: ${employee.daysUsed || 45} days
- Employment Role: ${employee.role || 'Standard Remote'}
- Permanent Establishment (PE) Risk Level: ${employee.peRisk || 'Moderate'}
- Social Security Treaty Status: ${employee.ssInfo?.form || 'Bilateral Certificate Pending'}

Provide a structured, detailed, professional brief formatted in clean markdown with the following sections:
1. **Executive Summary & Tax Risk**: Analyze permanent establishment and corporate tax exposure.
2. **Immigration & Day-Count Velocity**: Evaluate tax residency threshold risks based on days accrued.
3. **Social Security & Payroll Compliance**: Detail bilateral treaty application and employer withholding obligations.
4. **Recommended Action Items**: 3 concrete, actionable steps for the VP of People and CFO.

Keep the tone formal, expert, and authoritative.`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 800,
        }
      })
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Gemini API Error", 
        details: data.error?.message || data 
      }), { status: 200, headers: corsHeaders });
    }

    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || "Detailed compliance review unavailable.";

    return new Response(JSON.stringify({ 
      success: true, 
      summary: summary, 
      brief: summary 
    }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: err.message 
    }), { status: 200, headers: corsHeaders });
  }
}
