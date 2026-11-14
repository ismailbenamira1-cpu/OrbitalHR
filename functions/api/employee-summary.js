export async function onRequest(context) {
  const { request, env } = context;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const employee = body.employee || {};
    const apiKey = env.GEMINI_API_KEY || env.API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY missing in Cloudflare settings.' }), { status: 500, headers: corsHeaders });
    }

    const prompt = `Summarize compliance status for ${employee.homeCountry || 'US'} employee in ${employee.hostCountry || 'Canada'}. Days: ${employee.daysUsed || 0}, Role: ${employee.role || 'Remote'}. Provide 3 brief bullet points under 60 words.`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Compliance check operational.';

    return new Response(JSON.stringify({ summary: text, brief: text }), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}
