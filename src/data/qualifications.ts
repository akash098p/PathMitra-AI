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
    canChoose: ['science-pcm', 'science-pcb', 'commerce-ip', 'arts-humanities', 'polytechnic', 'iti'],
  },
  {
    id: 'class12-science',
    label: 'Class 12 — Science (PCM / PCB)',
    emoji: '🧪',
    helper: 'Looking at engineering, medical, or science degrees.',
    canChoose: ['science-pcm', 'science-pcb', 'paramedical', 'bca'],
  },
  {
    id: 'class12-commerce',
    label: 'Class 12 — Commerce',
    emoji: '📊',
    helper: 'Looking at B.Com, BBA, CA, or computer applications.',
    canChoose: ['commerce-ip', 'bca'],
  },
  {
    id: 'class12-arts',
    label: 'Class 12 — Arts / Humanities',
    emoji: '📚',
    helper: 'Looking at law, civil services, media, or design.',
    canChoose: ['arts-humanities', 'bca'],
  },
  {
    id: 'diploma',
    label: 'Diploma (Polytechnic) student / holder',
    emoji: '🛠️',
    helper: 'Either finishing the diploma or planning lateral entry to B.Tech.',
    canChoose: ['polytechnic', 'science-pcm', 'bca'],
  },
  {
    id: 'iti',
    label: 'ITI trade certificate holder',
    emoji: '⚙️',
    helper: 'Trade certified — heading to jobs, apprenticeship, or higher study.',
    canChoose: ['iti', 'polytechnic'],
  },
  {
    id: 'undergraduate',
    label: 'In a degree course now (B.Tech / BCA / B.Sc / B.Com)',
    emoji: '🎓',
    helper: 'Wanting internships, skills, and government exam guidance.',
    canChoose: ['bca', 'science-pcm'],
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