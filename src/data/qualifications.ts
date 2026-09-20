import type { InterestId, Qualification } from '@/lib/types';

// ============================================================================
// Onboarding step 1 — the student tells us where they are. Nothing is assumed.
// ============================================================================

export const QUALIFICATIONS: Qualification[] = [
  {
    id: 'class10',
    label: 'Class 10 completed / appearing',
    emoji: '🎒',
    helper: 'Choosing a stream, diploma, or ITI trade right now.',
    canChoose: ['science-pcm', 'science-pcb', 'commerce-ip', 'arts-humanities', 'polytechnic', 'iti', 'vocational'],
  },
  {
    id: 'class11',
    label: 'Class 11 (studying)',
    emoji: '📗',
    helper: 'Early planner — building the stream strategy and entrance base for after Class 12.',
    canChoose: ['science-pcm', 'science-pcb', 'commerce-ip', 'arts-humanities', 'polytechnic', 'iti', 'vocational'],
  },
  {
    id: 'class12-science',
    label: 'Class 12 — Science (PCM / PCB)',
    emoji: '🧪',
    helper: 'Looking at engineering, medical, or science degrees.',
    canChoose: ['science-pcm', 'science-pcb', 'engineering', 'paramedical', 'nursing', 'd-pharm', 'b-pharm', 'general-degree', 'bca', 'b-ed'],
  },
  {
    id: 'class12-commerce',
    label: 'Class 12 — Commerce',
    emoji: '📊',
    helper: 'Looking at B.Com, BBA, CA, or computer applications.',
    canChoose: ['commerce-ip', 'general-degree', 'bca', 'b-ed'],
  },
  {
    id: 'class12-arts',
    label: 'Class 12 — Arts / Humanities',
    emoji: '📚',
    helper: 'Looking at law, civil services, media, or design.',
    canChoose: ['arts-humanities', 'general-degree', 'bca', 'b-ed'],
  },
  {
    id: 'diploma',
    label: 'Diploma (Polytechnic) student / holder',
    emoji: '🛠️',
    helper: 'Either finishing the diploma or planning lateral entry to B.Tech.',
    canChoose: ['polytechnic', 'engineering', 'science-pcm', 'bca'],
  },
  {
    id: 'iti',
    label: 'ITI trade certificate holder',
    emoji: '⚙️',
    helper: 'Trade certified — heading to jobs, apprenticeship, or higher study.',
    canChoose: ['iti', 'polytechnic', 'vocational'],
  },
  {
    id: 'btech-student',
    label: 'Currently studying B.Tech / B.E.',
    emoji: '💻',
    helper: 'Need help with departments, projects, internships, placements, GATE or engineering jobs.',
    canChoose: ['engineering', 'm-sc', 'phd', 'general-degree'],
  },
  {
    id: 'medical-student',
    label: 'Medical / healthcare student (MBBS, B.Sc Nursing, paramedical)',
    emoji: '🩺',
    helper: 'Planning PG entrance, government service, or clinical and allied careers.',
    canChoose: ['nursing', 'paramedical', 'm-sc', 'phd', 'general-degree', 'b-ed'],
  },
  {
    id: 'b-ed-student',
    label: 'Currently studying B.Ed',
    emoji: '📖',
    helper: 'Planning teaching practice, TET/CTET, school jobs, M.Ed or education careers.',
    canChoose: ['b-ed', 'general-degree'],
  },
  {
    id: 'undergraduate',
    label: 'In another degree course (BCA / B.Sc / B.Com)',
    emoji: '🎓',
    helper: 'Wanting internships, skills, postgraduate study, and government exam guidance.',
    canChoose: ['bca', 'engineering', 'general-degree', 'b-ed', 'm-sc', 'phd', 'science-pcm'],
  },
  {
    id: 'graduate',
    label: 'Degree completed (BA / B.Sc / B.Com / BCA / B.Tech)',
    emoji: '🎓',
    helper: 'Ready for jobs, placements, internships, government exams or postgraduate study.',
    canChoose: ['m-sc', 'phd', 'b-ed', 'general-degree', 'vocational'],
  },
  {
    id: 'postgraduate',
    label: 'Postgraduate (Masters completed / pursuing)',
    emoji: '🎓',
    helper: 'Aiming at research, NET/SET teaching, specialist roles or a second skill.',
    canChoose: ['phd', 'b-ed', 'general-degree'],
  },
];

export function findQualification(id: string): Qualification | undefined {
  return QUALIFICATIONS.find((q) => q.id === id);
}

// ============================================================================
// Interest vocabulary — shared by the quiz, the skill tracks and the engine.
// ============================================================================

export const INTERESTS: Record<InterestId, { label: string; emoji: string; blurb: string }> = {
  coding: {
    label: 'Computers & coding',
    emoji: '💻',
    blurb: 'Building software, websites, apps, or solving logic problems.',
  },
  medicine: {
    label: 'Biology & healthcare',
    emoji: '🩺',
    blurb: 'Human body, patient care, diagnostics, or lab science.',
  },
  defence: {
    label: 'Defence & uniformed services',
    emoji: '🎖️',
    blurb: 'Discipline, physical fitness, national service, adventure.',
  },
  business: {
    label: 'Business, money & sales',
    emoji: '📈',
    blurb: 'Accounts, markets, entrepreneurship, negotiation.',
  },
  design: {
    label: 'Design & creativity',
    emoji: '🎨',
    blurb: 'Visual design, user experience, animation, content.',
  },
  'govt-service': {
    label: 'Government service',
    emoji: '🏛️',
    blurb: 'Stable sarkari job, public administration, exams.',
  },
  'hands-on': {
    label: 'Machines & hands-on work',
    emoji: '🔧',
    blurb: 'Repairing, building, wiring, operating equipment.',
  },
  research: {
    label: 'Science & research',
    emoji: '🔬',
    blurb: 'Experiments, theory, deep analysis, discovery.',
  },
  media: {
    label: 'Media & communication',
    emoji: '🎙️',
    blurb: 'Writing, speaking, journalism, video, marketing.',
  },
  law: {
    label: 'Law & debate',
    emoji: '⚖️',
    blurb: 'Rights, argument, reading, public policy.',
  },
  agriculture: {
    label: 'Agriculture & environment',
    emoji: '🌱',
    blurb: 'Farming science, food processing, sustainability.',
  },
  teaching: {
    label: 'Teaching & mentoring',
    emoji: '🧑‍🏫',
    blurb: 'Explaining ideas, training others, working with children.',
  },
};

export const INTEREST_LIST = Object.keys(INTERESTS) as InterestId[];