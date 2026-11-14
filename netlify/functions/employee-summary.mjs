import { GoogleGenerativeAI } from '@google/generative-ai';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { employee } = await req.json();
    
    // Initialize the Gemini SDK using Netlify's environment key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a cross-border HR and corporate tax compliance analyst. 
Summarize this employee's compliance status in 3 short, actionable bullet points for a CFO and VP of People (maximum 85 words total):
- Home Country: ${employee.homeCountry || 'US'}
- Host Country: ${employee.hostCountry || 'Unknown'}
- Days Accrued: ${employee.days || 0}
- Role Type: ${employee.role || 'Standard Remote'}
- PE Risk Level: ${employee.peRisk || 'Low'}
- Social Security Treaty: ${employee.treatyStatus || 'Check Bilateral Agreement'}
- Current Payroll Model: ${employee.payrollModel || 'Home Payroll'}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ summary: text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate AI brief', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
