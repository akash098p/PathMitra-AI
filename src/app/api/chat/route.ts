import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, educationStage, goal, userState } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY?.replace(/['"]/g, '').trim();

    if (!apiKey) {
      return NextResponse.json({
        reply: "⚠️ **Missing OpenRouter Key**: Please ensure `OPENROUTER_API_KEY=sk-or-v1-...` is declared in your `.env.local` file and the server is restarted."
      });
    }

    const systemPrompt = `You are PathMitra AI, India's most knowledgeable, empathetic education and career advisor for students (Class 10, 12, Diploma, College) and parents.
Current Context:
- Student Stage: ${educationStage || 'Class 10 Completed'}[cite: 2, 3]
- Target Goal: ${goal || 'Technology & Engineering'}[cite: 2, 3]
- State / Region: ${userState || 'All-India / West Bengal'}[cite: 2, 3]

Your Knowledge Base:
1. Academic Streams: Science (PCM/PCB/PCMB), Commerce (with Applied Maths/IP), Humanities/Arts, Polytechnic (3-Yr Diploma), ITI (1-2 Yr Trades)[cite: 2, 3].
2. Entrance Exams: JEE Main/Advanced, NEET-UG, CUET, WBJEE, MHT-CET, KCET, COMEDK, JEECUP, JEXPO, BITSAT, NDA[cite: 2, 3].
3. Lateral Entry Norms (AICTE): 3-Year Polytechnic Diploma holders are eligible for direct admission to 2nd year (3rd semester) B.Tech/BE programs via state lateral entry tests (JELET, LEET, etc.) without appearing for JEE Main.
4. Government Career Exams:
   - After 10th: SSC MTS, RRB Group D, Indian Navy MR, Indian Army Tradesman, State Police.
   - After 12th: SSC CHSL, SSC Stenographer, NDA (National Defence Academy), RRB ALP (Technician), Coast Guard Navik.
   - After Diploma/Grad: SSC JE, RRB JE, State PSC Junior Engineer, UPSC CSE, Banking (IBPS/SBI).
5. Private Industry Compensation: Realistic starter packages (TCS/Infosys/Wipro Service: ₹3.5-4.5 LPA; Mid-tier/Product Startups: ₹6-12 LPA; Tier-1 Tech/GCCs: ₹14-25+ LPA).

Response Rules:
- Address both students and anxious parents clearly and constructively.
- Present unbiased pros and cons: explain fees, preparation intensity, risk factors, and fallback career plans[cite: 2, 3].
- Never prescribe only one "magic" route[cite: 2, 3].
- Format cleanly with bold headings and concise bullet points.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'PathMitra AI Senior Guide',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('OpenRouter error:', err);
      return NextResponse.json({
        reply: `⚠️ **OpenRouter Service Notice**: ${err.error?.message || 'Unable to fetch response. Please verify key.'}`
      });
    }

    const data = await response.json();
    return NextResponse.json({ 
      reply: data.choices?.[0]?.message?.content || "I couldn't process that query. Please ask again." 
    });
  } catch (error: any) {
    return NextResponse.json(
      { reply: "A network error occurred while communicating with PathMitra AI. Please retry." },
      { status: 500 }
    );
  }
}