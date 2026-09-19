import { NextResponse } from 'next/server';
import { answerLocally, contextualFollowUp } from '@/lib/chatbrain';
import { EMPTY_PROFILE, describeProfile } from '@/lib/profile';
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
  history?: { role: 'user' | 'assistant'; content: string }[];
}

type ChatTurn = { role: 'user' | 'assistant'; content: string };
type CachedAnswer = { question: string; topic: string; reply: string; createdAt: number };

const learnedAnswers: CachedAnswer[] = [];
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_LIMIT = 100;

function words(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !['what', 'which', 'how', 'does', 'tell', 'give', 'about', 'the'].includes(word)),
  );
}

function findLearnedAnswer(question: string, topic: string): string | null {
  const now = Date.now();
  const currentWords = words(question);
  for (let index = learnedAnswers.length - 1; index >= 0; index -= 1) {
    const cached = learnedAnswers[index];
    if (now - cached.createdAt > CACHE_TTL_MS) {
      learnedAnswers.splice(index, 1);
      continue;
    }
    if (topic && cached.topic && !cached.topic.includes(topic) && !topic.includes(cached.topic)) continue;
    const cachedWords = words(cached.question);
    const overlap = [...currentWords].filter((word) => cachedWords.has(word)).length;
    const coverage = overlap / Math.max(currentWords.size, cachedWords.size, 1);
    if (coverage >= 0.65 && overlap >= 2) return cached.reply;
  }
  return null;
}

function rememberAnswer(question: string, topic: string, reply: string): void {
  learnedAnswers.push({ question, topic, reply, createdAt: Date.now() });
  if (learnedAnswers.length > CACHE_LIMIT) learnedAnswers.shift();
}

function geminiSystemPrompt(profile: StudentProfile, message: string): string {
  const detailed = /full details|in detail|detailed|explain fully|explain everything|more details|complete details/i.test(message);
  return [
    'You are PathMitra AI, an empathetic education-to-career guide for Indian students and their parents. You explain options and trade-offs instead of prescribing one destiny.',
    '',
    'Student profile (use it, do not repeat it back verbatim):',
    describeProfile(profile),
    '',
    'Answer rules:',
    detailed
      ? '- Give a structured, detailed answer in 220–260 words: overview, eligibility, duration or amount, application steps, documents, benefits, limitations and official links where relevant.'
      : '- Keep the answer under 140 words unless the student asks for full or detailed information. Be plain, warm and concrete.',
    '- Never use markdown headings (#, ##). Use short bullet lines starting with "-" and **bold** for labels.',
    '- Present at least two sides when the student faces a choice, including money and time to first salary.',
    '- For anything about exams, admissions or schemes, end with 1-2 official links written as [Portal Name](https://official-url) — for example [JEE Main](https://jeemain.nta.nic.in) or [National Scholarship Portal](https://scholarships.gov.in).',
    '- If unsure about a date or fee, say it must be verified on the official portal instead of inventing numbers.',
    '- Use Indian names, states, boards and currencies. Hindi/Bengali/Marathi phrases are fine in brackets if they genuinely help.',
    '- Speak to both the student and the parent, but obviously keep it warm to the student.',
  ].join('\n');
}

async function callGemini(profile: StudentProfile, message: string, history: ChatTurn[]): Promise<string | null> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY?.replace(/['"]/g, '').trim();
  if (!apiKey) return null;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: geminiSystemPrompt(profile, message) }] },
      contents: [
        ...history.map((turn) => ({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.content }],
        })),
        { role: 'user', parts: [{ text: message }] },
      ],
      generationConfig: {
        temperature: 0.5,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 900,
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

async function callOpenRouter(profile: StudentProfile, message: string, history: ChatTurn[]): Promise<string | null> {
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
      model: 'meta-llama/llama-3.1-8b-instruct',
      messages: [
        { role: 'system', content: geminiSystemPrompt(profile, message) },
        ...history,
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
    const history = (body.history ?? [])
      .filter((turn) => turn && typeof turn.content === 'string' && turn.content.trim())
      .slice(-10)
      .map((turn) => ({ role: turn.role, content: turn.content.trim().slice(0, 2000) }));

    // 1. Use verified local data when the question matches a known topic.
    // This runs on every turn, not only the first one: the extended brain
    // covers fees, salaries, government jobs, duration, scholarships, skills,
    // stream choice and follow-up questions, so most conversations never reach
    // an AI provider at all. Specific unknown organisations and schemes still
    // return null so the providers can answer them.
    const localAnswer = answerLocally(cleanMsg, profile);

    // A short follow-up ("and the fees?", "what about for girls?") carries no
    // subject of its own, so resolve it against the previous student question
    // before settling for a generic overview answer.
    const genericOverview = localAnswer ? /-overview$/.test(localAnswer.source) : false;
    if (localAnswer && !genericOverview) {
      return NextResponse.json({ reply: localAnswer.reply, source: localAnswer.source });
    }

    const followUp = contextualFollowUp(cleanMsg, history, profile);
    if (followUp) {
      return NextResponse.json({ reply: followUp.reply, source: followUp.source });
    }

    if (localAnswer) {
      return NextResponse.json({ reply: localAnswer.reply, source: localAnswer.source });
    }

    const topic = history.filter((turn) => turn.role === 'user').at(-1)?.content.toLowerCase() ?? '';
    const learnedReply = findLearnedAnswer(cleanMsg, topic);
    if (learnedReply) {
      return NextResponse.json({ reply: learnedReply, source: 'learned-answer' });
    }

    // 2. Primary external AI: Gemini 3.6 Flash via Google AI Studio.
    const geminiReply = await callGemini(profile, cleanMsg, history);
    if (geminiReply && geminiReply.length > 10) {
      rememberAnswer(cleanMsg, topic, geminiReply);
      return NextResponse.json({ reply: geminiReply, source: 'ai-generated-gemini' });
    }

    // 3. Secondary fallback: OpenRouter (Llama 3.1 8B).
    const openRouterReply = await callOpenRouter(profile, cleanMsg, history);
    if (openRouterReply && openRouterReply.length > 10) {
      rememberAnswer(cleanMsg, topic, openRouterReply);
      return NextResponse.json({ reply: openRouterReply, source: 'ai-generated-openrouter' });
    }

    // If both providers failed or returned empty, give an honest fallback with
    // concrete places to look instead of a fake confident answer.
    // If both providers failed or returned empty, give an honest fallback with
    // concrete places to look instead of a fake confident answer. When no
    // provider key is configured at all we say that plainly, because "the AI
    // service failed" is misleading in that case.
    const providerConfigured = Boolean(process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.OPENROUTER_API_KEY);
    if (!providerConfigured) {
      console.warn('[PathMitra/chat] No AI provider key configured — answering from bundled data only.');
    }
    return NextResponse.json({
      reply: providerConfigured
        ? 'I could not answer this one from my own data, and the AI service did not return a usable reply just now. Try the Explore tab for streams or the Guide tab for exams, fees, jobs and scholarships — that data is built into this app. Rephrasing also helps: name a specific stream, exam, fee, government job, scholarship or skill.'
        : 'This question goes beyond the data bundled in the app, and the live AI helper is not configured on this deployment. Ask me about streams, diplomas, ITI trades, entrance exams, government and private jobs, scholarships, fees, duration or a step-by-step plan — all of that is answered from this app\'s own verified data.',
      source: providerConfigured ? 'no-ai-reply' : 'offline-only',
    });
  } catch {
    return NextResponse.json(
      { reply: 'A network error occurred while reaching the advisor. Please try again shortly.' },
      { status: 500 },
    );
  }
}
