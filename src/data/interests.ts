import type { InterestQuestion } from '@/lib/types';

// ============================================================================
// Onboarding step 2 — a 6-question interest diagnostic.
// No student should be forced to name a career at 16, so the quiz asks about
// the *work*, never about job titles.
// ============================================================================

export const INTEREST_QUESTIONS: InterestQuestion[] = [
  {
    id: 'weekend',
    prompt: 'A free Sunday with no homework. What actually pulls you in?',
    options: [
      { label: 'Fixing or building something with my hands', interests: ['hands-on'], emoji: '🔧' },
      { label: 'Trying a new app, game mod, or small program', interests: ['coding'], emoji: '💻' },
      { label: 'Drawing, editing videos, or designing posters', interests: ['design', 'media'], emoji: '🎨' },
      { label: 'Reading about money, business, or a new scheme', interests: ['business'], emoji: '📈' },
    ],
  },
  {
    id: 'subject',
    prompt: 'Which school subject feels least like a burden?',
    options: [
      { label: 'Mathematics and Physics', interests: ['research', 'coding'], emoji: '🧮' },
      { label: 'Biology and Chemistry', interests: ['medicine', 'research'], emoji: '🧬' },
      { label: 'History, Civics, and Languages', interests: ['law', 'govt-service', 'media'], emoji: '📜' },
      { label: 'Accounts, Economics, and Statistics', interests: ['business'], emoji: '🧾' },
    ],
  },
  {
    id: 'problemsolving',
    prompt: 'Your friend shows you a broken laptop. Your first instinct?',
    options: [
      { label: 'Open it up and check the hardware', interests: ['hands-on', 'coding'], emoji: '🛠️' },
      { label: 'Reinstall, run diagnostics, check the OS', interests: ['coding'], emoji: '💽' },
      { label: 'Search, compare and decide what to buy next', interests: ['business'], emoji: '🔍' },
      { label: 'Explain the whole thing to them patiently', interests: ['teaching'], emoji: '🧑‍🏫' },
    ],
  },
  {
    id: 'worklife',
    prompt: 'Which working picture appeals to you most?',
    options: [
      { label: 'A desk, a laptop, solving technical puzzles', interests: ['coding', 'design'], emoji: '🧑‍💻' },
      { label: 'A hospital, clinic, or laboratory', interests: ['medicine'], emoji: '🏥' },
      { label: 'A site, workshop, or factory floor', interests: ['hands-on'], emoji: '🏗️' },
      { label: 'A court, office, or field posting for the country', interests: ['defence', 'govt-service', 'law'], emoji: '🏛️' },
    ],
  },
  {
    id: 'stability',
    prompt: 'What matters more to you personally?',
    options: [
      { label: 'A predictable, secure government career', interests: ['govt-service', 'defence'], emoji: '🛡️' },
      { label: 'Fast growth and high pay in private industry', interests: ['coding', 'business'], emoji: '🚀' },
      { label: 'Respect and the chance to serve people', interests: ['medicine', 'teaching', 'govt-service'], emoji: '🤝' },
      { label: 'Freedom to create my own thing', interests: ['design', 'media', 'business'], emoji: '✨' },
    ],
  },
  {
    id: 'environment',
    prompt: 'Where and how do you want to live while you study?',
    options: [
      { label: 'Stay at home, study in my own city or state', interests: ['govt-service', 'agriculture'], emoji: '🏠' },
      { label: 'Move anywhere in India for the best college', interests: ['research', 'coding', 'medicine'], emoji: '🚆' },
      { label: 'Outside in fields, plants, nature, animals', interests: ['agriculture', 'research'], emoji: '🌾' },
      { label: 'Somewhere I can train physically every day', interests: ['defence', 'hands-on'], emoji: '🏃' },
    ],
  },
];

/** Turn quiz answers into a weighted interest list (highest first). */
export function tallyInterests(answers: Record<string, number>): string[] {
  const counts = new Map<string, number>();
  for (const question of INTEREST_QUESTIONS) {
    const chosen = answers[question.id];
    if (chosen === undefined) continue;
    const option = question.options[chosen];
    if (!option) continue;
    for (const interest of option.interests) {
      counts.set(interest, (counts.get(interest) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([interest]) => interest);
}