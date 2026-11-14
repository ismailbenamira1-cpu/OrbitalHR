import { GoogleGenerativeAI } from '@google/generative-ai';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Intercept the AI Brief API request
    if (url.pathname === '/api/employee-summary' && request.method === 'POST') {
      try {
        const { employee } = await request.json();
        const apiKey = env.GEMINI_API_KEY || env.API_KEY;

        if (!apiKey) {
          return new Response(JSON.stringify({ error: 'Gemini API key not configured in Worker environment' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a cross-border HR and corporate tax compliance analyst. 
Summarize this employee's compliance status in 3 short, actionable bullet points for a CFO and VP of People (maximum 85 words total):
- Home Country: ${employee.homeCountry || 'US'}
- Host Country: ${employee.hostCountry || 'Unknown'}
- Days Accrued: ${employee.daysUsed || 0}
- Role Type: ${employee.role || 'Standard Remote'}
- PE Risk Level: ${employee.peRisk || 'Low'}
- Social Security Treaty: ${employee.ssInfo?.form || 'Check Bilateral Agreement'}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return new Response(JSON.stringify({ summary: text, brief: text }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to generate AI brief', details: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 2. Serve static frontend assets from the 'dist' folder for all other routes
    return env.ASSETS.fetch(request);
  },
};
