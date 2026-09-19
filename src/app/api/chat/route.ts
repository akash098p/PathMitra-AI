import { NextResponse } from 'next/server';
import { answerLocally } from '@/lib/chatbrain';
import { EMPTY_PROFILE, BUDGET_LABELS, MOBILITY_LABELS, RISK_LABELS, PRIORITY_LABELS, describeProfile } from '@/lib/profile';
import type { StudentProfile } from '@/lib/types';

// ============================================================================
// /api/chat — the advisor endpoint.
// Order of operations:
//   1. Local greeting/bonding/capability replies (instant, no network).
//   2. Answer from PathMitra's own verified datasets (zero LLM tokens).
//   3. Gemini Flash via Google AI Studio — primary external provider.
//   4. OpenRouter (Llama 3.1 8B Instruct free) — secondary fallback if
//      Gemini is unavailable, rate-limited, or empty.
// ============================================================================

interface ChatRequest {
  message?: string;
  profile?: Partial<StudentProfile>;
}

function geminiSystemPrompt(profile: StudentProfile): string {
  return [
    'You are PathMitra AI, an empathetic education-to-career guide for Indian students and their parents. You explain options and trade-offs instead of prescribing one destiny.',
    '',
    'Student profile (use it, do not repeat it back verbatim):',
    describeProfile(profile),
    '',
    'Answer rules:',
    '- Under 120 words. Plain, warm, concrete.',
    '- Never use markdown headings (#, ##). Use short bullet lines starting with "-" and **bold** for labels.',
    '- Present at least two sides when the student faces a choice, including money and time to first salary.',
    '- For anything about exams, admissions or schemes, end with 1-2 official links written as [Portal Name](https://official-url) — for example [JEE Main](https://jeemain.nta.nic.in) or [National Scholarship Portal](https://scholarships.gov.in).',
    '- If unsure about a date or fee, say it must be verified on the official portal instead of inventing numbers.',
    '- Use Indian names, states, boards and currencies. Hindi/Bengali/Marathi phrases are fine in brackets if they genuinely help.',
    '- Speak to both the student and the parent, but obviously keep it warm to the student.',
  ].join('\n');
}

async function callGemini(profile: StudentProfile, message: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY?.replace(/['"]/g, '').trim();
  if (!apiKey) return null;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: geminiSystemPrompt(profile) }] },
      contents: [
        { role: 'user', parts: [{ text: message }] },
      ],
      generationConfig: {
        temperature: 0.5,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 512,
        responseMimeType: 'text/plain',
      },
    }),
  });

  if (!response.ok) {
    const err = (await response.json()) as { error?: { message?: string } };
    console.warn('[PathMitra/chat] Gemini error:', err.error?.message ?? response.status);
    return null;
  }

  const data = (await response.json()) as {
    candidates?: {
      content?: { parts?: { text?: string }[] };
    }[];
  };
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!raw.trim()) return null;

  return raw.replace(/#{1,6}\s?/g, '');
}

async function callOpenRouter(profile: StudentProfile, message: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY?.replace(/['"]/g, '').trim();
  if (!apiKey) return null;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      'X-Title': 'PathMitra AI',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [
        { role: 'system', content: geminiSystemPrompt(profile) },
        { role: 'user', content: message },
      ],
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    const err = (await response.json()) as { error?: { message?: string } };
    console.warn('[PathMitra/chat] OpenRouter error:', err.error?.message ?? response.status);
    return null;
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = data.choices?.[0]?.message?.content ?? '';
  if (!raw.trim()) return null;

  return raw.replace(/#{1,6}\s?/g, '');
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequest;
    const cleanMsg = (body.message ?? '').trim();
    if (!cleanMsg) {
      return NextResponse.json({ reply: 'Please type a question and I will answer it.' });
    }

    const profile: StudentProfile = { ...EMPTY_PROFILE, ...(body.profile ?? {}) };

    // 1. Instant conversational replies: greetings, thanks, capabilities, goodbye.
    const localGreeting = answerLocally(cleanMsg, profile);
    if (localGreeting) {
      return NextResponse.json({ reply: localGreeting.reply, source: localGreeting.source });
    }

    // 2. Grounded answer from the datasets — instant and token-free.
    const factualLocal = answerLocally(cleanMsg, profile);
    if (factualLocal) {
      return NextResponse.json({ reply: factualLocal.reply, source: factualLocal.source });
    }

    // 3. Primary external AI: Gemini 2.0 Flash via Google AI Studio.
    const geminiReply = await callGemini(profile, cleanMsg);
    if (geminiReply && geminiReply.length > 10) {
      return NextResponse.json({ reply: geminiReply, source: 'ai-generated-gemini' });
    }

    // 4. Secondary fallback: OpenRouter (Llama 3.1 8B free).
    const openRouterReply = await callOpenRouter(profile, cleanMsg);
    if (openRouterReply && openRouterReply.length > 10) {
      return NextResponse.json({ reply: openRouterReply, source: 'ai-generated-openrouter' });
    }

    // If both providers failed or returned empty, give an honest fallback with
    // concrete places to look instead of a fake confident answer.
    return NextResponse.json({
      reply:
        'I could not answer this one from my own data, and the AI service did not return a usable reply just now. Try the Explore tab for streams or the Guide tab for exams, fees, jobs and scholarships — that data is built into this app.',
      source: 'no-ai-reply',
    });
  } catch {
    return NextResponse.json(
      { reply: 'A network error occurred while reaching the advisor. Please try again shortly.' },
      { status: 500 },
    );
  }
}
