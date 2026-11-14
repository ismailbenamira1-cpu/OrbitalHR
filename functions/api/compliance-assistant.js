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
    const body = await request.json();
    const userQuery = body.query || 'Give me an overview of our compliance status.';
    const roster = body.roster || [];

    const apiKey = env.GEMINI_API_KEY || env.API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: 'GEMINI_API_KEY is missing in Cloudflare Pages settings.' }), { status: 200, headers: corsHeaders });
    }

    // Convert the active roster into a clean text summary for the AI context
    const rosterSummary = roster.map(emp => 
      `- Name: ${emp.name}, Home: ${emp.homeCountry}, Host: ${emp.hostRegion || emp.hostCountry}, Days Used: ${emp.daysUsed}, PE Risk: ${emp.peRisk}, Treaty Form: ${emp.ssInfo?.form}, Recommendation: ${emp.recommendation}`
    ).join('\n');

    const systemPrompt = `You are OrbitalCopilot, an expert AI cross-border HR and corporate tax compliance assistant embedded inside the OrbitalHR platform. 
You have direct visibility into the company's active employee roster and compliance data:

${rosterSummary || 'No employees currently loaded.'}

Answer the user's question accurately, concisely, and professionally based on this data. If they ask about specific employees, tax rules, permanent establishment (PE) risks, visa day-counts, or EOR graduation, reference the roster details directly. Keep responses clear and formatted in markdown.`;

    // Call Gemini with multi-model fallback & retry
    const modelsToTry = ['gemini-3.8-flash', 'gemini-1.5-pro'];
    let data = null;

    for (const model of modelsToTry) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: systemPrompt + '\n\nUser Question: ' + userQuery }] }
            ],
            generationConfig: { temperature: 0.4, maxOutputTokens: 1000 }
          })
        });

        if (res.ok) {
          data = await res.json();
          break;
        }
      } catch (e) {
        // Try next model
      }
    }

    if (!data || !data.candidates) {
      return new Response(JSON.stringify({ success: false, error: 'AI Copilot is temporarily busy. Please try again.' }), { status: 200, headers: corsHeaders });
    }

    const answer = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ success: true, answer }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 200, headers: corsHeaders });
  }
}
