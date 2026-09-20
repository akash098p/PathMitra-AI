import { NextResponse } from 'next/server';
import { STAGE_QUIZ_GROUP, interestQuestionsFor, tallyInterests } from '@/data/interests';
import { INTERESTS, QUALIFICATIONS } from '@/data/qualifications';
import { stageCoverage } from '@/lib/stagematch';

// Temporary QA endpoint — verifies every stage gets non-empty, relevant content
// on each screen (careers, scholarships, exams, skills, opportunities, roadmap)
// and that the stage-specific interest quiz is complete and well-formed.
export function GET() {
  const quiz = QUALIFICATIONS.map((q) => {
    const questions = interestQuestionsFor(q.id);
    const interestIds = Object.keys(INTERESTS);
    const unknown = questions.flatMap((question) =>
      question.options.flatMap((option) => option.interests.filter((i) => !interestIds.includes(i))),
    );
    // Every question must be answerable and produce at least one interest.
    const sample = tallyInterests(
      Object.fromEntries(questions.map((question) => [question.id, 0])),
      questions,
    );
    return {
      stage: q.id,
      group: STAGE_QUIZ_GROUP[q.id],
      questions: questions.length,
      optionsPerQuestion: questions.map((question) => question.options.length).join('/'),
      invalidInterestIds: [...new Set(unknown)],
      sampleInterests: sample.slice(0, 4),
    };
  });
  return NextResponse.json({ stages: stageCoverage(), quiz });
}