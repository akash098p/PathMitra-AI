import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, educationStage, goal } = await req.json();

    // System prompt enforcing PathMitra's core guidance philosophy
    const systemPrompt = `You are PathMitra AI, a supportive, explainable career companion for Indian students.
Current Student Stage: ${educationStage || 'Class 10 Completed'}
Goal: ${goal || 'Explore Technology Careers'}

Guidance Guidelines:
1. Recommend and compare paths (e.g., Science PCM, Polytechnic Diploma, ITI, BCA) with clear trade-offs instead of declaring a single "perfect" choice.
2. Keep explanations accessible for high schoolers.
3. Suggest concrete next steps: foundation skills, project ideas, and entrance exams.`;

    // Connect to your preferred LLM provider (OpenAI, Gemini, etc.) using your server environment variable
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      // Fallback intelligent response if no API key is configured yet
      return NextResponse.json({
        reply: `As a ${educationStage} student aiming for ${goal}, you have great options! If you prefer practical hands-on work immediately, a 3-year Diploma in Computer Engineering allows direct lateral entry into B.Tech 2nd year. If you prefer academic depth and keeping entrance exam doors (like JEE) open, Science with PCM (Class 11-12) is ideal.`
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return NextResponse.json({ reply: data.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate guidance' }, { status: 500 });
  }
}