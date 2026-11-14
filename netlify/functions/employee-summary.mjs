import { GoogleGenAI } from '@google/genai';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { employee } = await req.json();
    const ai = new GoogleGenAI({});

    const prompt = `You are a cross-border HR and corporate tax compliance analyst. 
Summarize this employee's compliance status in 3 short, actionable bullet points for a CFO and VP of People (maximum 85 words total):
- Home Country: ${employee.homeCountry || 'US'}
- Host Country: ${employee.hostCountry || 'Unknown'}
- Days Accrued: ${employee.days || 0}
- Role Type: ${employee.role || 'Standard Remote'}
- PE Risk Level: ${employee.peRisk || 'Low'}
- Social Security Treaty: ${employee.treatyStatus || 'Check Bilateral Agreement'}
- Current Payroll Model: ${employee.payrollModel || 'Home Payroll'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return new Response(JSON.stringify({ summary: response.text }), {
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
