import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, educationStage, goal } = await req.json();

    // Strip accidental whitespace or wrapping quotation marks from the environment variable
    const apiKey = process.env.OPENROUTER_API_KEY?.replace(/['"]/g, '').trim();

    if (!apiKey) {
      return NextResponse.json({
        reply: "⚠️ **Missing API Key**: Please set `OPENROUTER_API_KEY=sk-or-v1-...` inside your `.env.local` file and restart the development server (`npm run dev`)."
      });
    }

    const systemPrompt = `You are PathMitra AI, an intelligent, empathetic educational companion for Indian students[cite: 2, 3].
Current Student Profile: ${educationStage || 'Class 10 Completed'}[cite: 2, 3]
Target Career Goal: ${goal || 'Explore Technology Careers'}[cite: 2, 3]

Guidance Rules:
1. Explain Indian education pathways (Science PCM, 3-Year Polytechnic Diploma, ITI, BCA, B.Tech) with clarity and accuracy[cite: 2, 3].
2. Outline key eligibility criteria, duration, and entrance test routes (e.g., JEE Main, State CETs, Polytechnic JEXPO/JEECUP)[cite: 2, 3].
3. Present balanced trade-offs (hands-on technical labs vs theoretical curriculum) without forcing a single path[cite: 2, 3].
4. Format all responses cleanly using bullet points and standalone bold text for scannability.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'PathMitra AI',
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
      const errorData = await response.json();
      console.error('OpenRouter Free Router Error:', errorData);
      const errMsg = errorData.error?.message || 'Failed to complete request via OpenRouter free tier.';
      return NextResponse.json({
        reply: `⚠️ **OpenRouter Notice**: ${errMsg}`
      });
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content || "I couldn't retrieve a response. Please ask your question again.";

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('Route Handler Error:', error);
    return NextResponse.json(
      { reply: 'A network error occurred while communicating with the AI advisor. Please try again shortly.' },
      { status: 500 }
    );
  }
}