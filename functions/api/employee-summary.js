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
      // Proceed if body is empty
    }

    const apiKey = env.GEMINI_API_KEY || env.API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Configuration Error: GEMINI_API_KEY is missing in Cloudflare Pages Environment Variables." 
      }), { status: 200, headers: corsHeaders });
    }

    const prompt = `You are a cross-border HR compliance expert. Provide 3 short bullet points summarizing compliance status for ${employee.homeCountry || 'US'} remote worker in ${employee.hostCountry || 'Canada'}: Days: ${employee.daysUsed || 0}, Role: ${employee.role || 'Remote'}. Keep it under 60 words.`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const rawText = await geminiRes.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid JSON received from Gemini API", 
        rawResponse: rawText 
      }), { status: 200, headers: corsHeaders });
    }

    if (!geminiRes.ok) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Gemini API Error", 
        details: data.error?.message || data 
      }), { status: 200, headers: corsHeaders });
    }

    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || "Compliance review operational. No flags detected.";

    return new Response(JSON.stringify({ 
      success: true, 
      summary: summary, 
      brief: summary 
    }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: err.message,
      stack: err.stack 
    }), { status: 200, headers: corsHeaders });
  }
}
