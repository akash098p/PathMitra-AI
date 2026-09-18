import { NextResponse } from 'next/server';
import { answerLocally } from '@/lib/chatbrain';
import { EMPTY_PROFILE, BUDGET_LABELS, MOBILITY_LABELS, RISK_LABELS, PRIORITY_LABELS } from '@/lib/profile';
import type { StudentProfile } from '@/lib/types';

// ============================================================================
// /api/chat — the advisor endpoint.
// Order of operations:
//   1. Try to answer from PathMitra's own verified datasets (zero LLM tokens).
//   2. If nothing matches, ask the LLM with a strict, grounded system prompt
//      that already contains the student's profile and the official-link rule.
// ============================================================================

interface ChatRequest {
  message?: string;
  profile?: Partial<StudentProfile>;
}

function summariseProfile(profile: Partial<StudentProfile>): string {
  const bits: string[] = [];
  if (profile.qualification) bits.push(`Current stage: ${profile.qualification}`);
  if (profile.interests && profile.interests.length > 0) bits.push(`Interests: ${profile.interests.join(', ')}`);
  if (profile.budget) bits.push(`Family budget: ${BUDGET_LABELS[profile.budget] ?? profile.budget}`);
  if (profile.mobility) bits.push(`Mobility: ${MOBILITY_LABELS[profile.mobility] ?? profile.mobility}`);
  if (profile.risk) bits.push(`Risk appetite: ${RISK_LABELS[profile.risk] ?? profile.risk}`);
  if (profile.priorities && profile.priorities.length > 0) {
    bits.push(`Family priorities: ${profile.priorities.map((p) => PRIORITY_LABELS[p] ?? p).join(', ')}`);
  }
  return bits.length > 0 ? bits.join('\n') : 'The student has not completed onboarding yet — keep advice general but still comparative.';
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequest;
    const cleanMsg = (body.message ?? '').trim();
    if (!cleanMsg) {
      return NextResponse.json({ reply: 'Please type a question and I will answer it.' });
    }

    const profile: StudentProfile = { ...EMPTY_PROFILE, ...(body.profile ?? {}) };

    // 1. Grounded answer from the datasets — instant and token-free.
    const local = answerLocally(cleanMsg, profile);
    if (local) {
      return NextResponse.json({ reply: local.reply, source: local.source });
    }

    // 2. LLM fallback with strict formatting and grounding rules.
    const apiKey = process.env.OPENROUTER_API_KEY?.replace(/['"]/g, '').trim();
    if (!apiKey) {
      return NextResponse.json({
        reply:
          'I could not answer this one from my own data yet, and the AI service is not configured. Set `OPENROUTER_API_KEY` in `.env.local` and restart the server. Meanwhile, the Explore and Guide tabs cover exams, fees, jobs and scholarships for every route.',
        source: 'no-api-key',
      });
    }

    const systemPrompt = `You are PathMitra AI, an empathetic education-to-career guide for Indian students and their parents. You explain options and trade-offs instead of prescribing one destiny.

Student context (use it, do not repeat it back):
${summariseProfile(body.profile ?? {})}

Answer rules:
- Under 120 words. Plain, warm, concrete.
- Never use markdown headings (#, ##). Use short bullet lines starting with "-" and **bold** for labels.
- Present at least two sides when the student faces a choice, including money and time to first salary.
- For anything about exams, admissions or schemes, end with 1-2 official links written as [Portal Name](https://official-url) — for example [JEE Main](https://jeemain.nta.nic.in) or [National Scholarship Portal](https://scholarships.gov.in).
- If unsure about a date or fee, say it must be verified on the official portal instead of inventing numbers.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
        'X-Title': 'PathMitra AI',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: cleanMsg },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const err = (await response.json()) as { error?: { message?: string } };
      return NextResponse.json({
        reply: `The AI service replied with a problem: ${err.error?.message ?? 'please retry in a moment'}. The Guide tab has the verified data in the meantime.`,
        source: 'llm-error',
      });
    }

    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const reply = data.choices?.[0]?.message?.content?.replace(/#{1,6}\s?/g, '') ?? '';
    return NextResponse.json({ reply: reply || 'I could not generate an answer. Please rephrase your question.', source: 'ai-generated' });
  } catch {
    return NextResponse.json(
      { reply: 'A network error occurred while reaching the advisor. Please try again shortly.' },
      { status: 500 },
    );
  }
}
