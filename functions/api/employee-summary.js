export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const employee = body.employee || {};

    // 1. Check for Gemini API Key in Cloudflare environment variables
    const apiKey = env.GEMINI_API_KEY || env.API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is missing in Cloudflare Pages settings.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = `You are a cross-border HR and corporate tax compliance analyst. 
Summarize this employee's compliance status in 3 short, actionable bullet points for a CFO and VP of People (maximum 85 words total):
- Home Country: ${employee.homeCountry || 'US'}
- Host Country: ${employee.hostCountry || 'Unknown'}
- Days Accrued: ${employee.daysUsed || 0}
- Role Type: ${employee.role || 'Standard Remote'}
- PE Risk Level: ${employee.peRisk || 'Low'}
- Social Security Treaty: ${employee.ssInfo?.form || 'Check Bilateral Agreement'}`;

    // 2. Call Gemini API directly via native fetch (Zero npm dependencies required)
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(JSON.stringify({ error: `Gemini API rejected request: ${errText}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary generated.';

    return new Response(JSON.stringify({ summary: text, brief: text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error in employee-summary function' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
