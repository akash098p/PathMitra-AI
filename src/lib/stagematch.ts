import { CAREERS } from '@/data/careers';
import { EXAMS } from '@/data/exams';
import { findStageGuide } from '@/data/nextsteps';
import { OPPORTUNITIES, opportunitiesFor } from '@/data/opportunities';
import { PATHWAYS } from '@/data/pathways';
import { QUALIFICATIONS } from '@/data/qualifications';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { SKILL_TRACKS } from '@/data/skills';
import type {
  Career,
  Exam,
  Opportunity,
  Pathway,
  QualificationId,
  Scholarship,
  SkillTrack,
} from '@/lib/types';

// ============================================================================
// Stage-aware matching.
// The old screens matched everything through course chains (pathway.startsAfter
// and career.entryPathways). That breaks the moment a student is *already*
// qualified — a medical, degree or postgraduate student does not enter a career
// through a Class 12 course. This module matches by stage LEVEL instead, so
// every stage gets relevant, non-empty results.
// ============================================================================

export type StageLevel = 'school' | 'technical' | 'degree' | 'postgraduate';

const STAGE_LEVEL: Record<QualificationId, StageLevel> = {
  class10: 'school',
  class11: 'school',
  'class12-science': 'school',
  'class12-commerce': 'school',
  'class12-arts': 'school',
  diploma: 'technical',
  iti: 'technical',
  'btech-student': 'degree',
  'medical-student': 'degree',
  'b-ed-student': 'degree',
  undergraduate: 'degree',
  graduate: 'degree',
  postgraduate: 'postgraduate',
};

/** Stages at the same level — used to widen a match before falling back. */
const LEVEL_STAGES: Record<StageLevel, QualificationId[]> = {
  school: ['class10', 'class11', 'class12-science', 'class12-commerce', 'class12-arts'],
  technical: ['diploma', 'iti'],
  degree: ['btech-student', 'medical-student', 'b-ed-student', 'undergraduate', 'graduate'],
  postgraduate: ['postgraduate'],
};

/** Wording a listing uses when it is open to this level. */
const LEVEL_KEYWORDS: Record<StageLevel, string[]> = {
  school: ['class 10', 'class 12', '10th', '12th', 'matric'],
  technical: ['diploma', 'iti', 'trade', 'technician'],
  degree: ['graduation', 'graduate', 'degree', 'bachelor', 'b.tech', 'b.e.', 'b.sc', 'b.com', 'bca', 'mbbs', 'nursing', 'bds'],
  // A master's holder is eligible for every graduate-level role as well, so the
  // postgraduate list includes degree wording plus postgraduate wording.
  postgraduate: [
    'master',
    'postgraduate',
    'post-graduate',
    'm.tech',
    'm.sc',
    'mba',
    'phd',
    'jrf',
    'net',
    'graduation',
    'graduate',
    'degree',
    'bachelor',
    'any discipline',
  ],
};

const DEMAND_RANK: Record<Career['demandOutlook'], number> = {
  'very high': 0,
  high: 1,
  steady: 2,
  competitive: 3,
};

export function stageLevelOf(stage?: string | null): StageLevel | null {
  if (!stage) return null;
  return STAGE_LEVEL[stage as QualificationId] ?? null;
}

export function allowedPathwayIds(stage?: string | null): Set<string> {
  const meta = stage ? QUALIFICATIONS.find((q) => q.id === stage) : undefined;
  return new Set(meta ? meta.canChoose : PATHWAYS.map((p) => p.id));
}

/** Courses a student at this stage can actually enter next. */
export function pathwaysForStage(stage?: string | null): Pathway[] {
  const allowed = allowedPathwayIds(stage);
  return PATHWAYS.filter((p) => allowed.has(p.id));
}

function textHasAny(text: string, needles: string[]): boolean {
  const hay = text.toLowerCase();
  return needles.some((n) => hay.includes(n));
}

function careerMatchesStage(career: Career, stage?: string | null): boolean {
  const level = stageLevelOf(stage);
  if (!level) return true;
  const allowed = allowedPathwayIds(stage);
  if (career.entryPathways.some((p) => allowed.has(p))) return true;
  return textHasAny(career.minimumQualification, LEVEL_KEYWORDS[level]);
}

/** True when this role is genuinely open from the student's stage. */
export function isCareerCloseMatch(career: Career, stage?: string | null): boolean {
  return careerMatchesStage(career, stage);
}

/**
 * Careers ordered for the stage: closest matches first, then everything else by
 * demand. Never empty — the full market stays visible with the relevant part on
 * top, which is more useful and more honest than hiding roles.
 */
export function careersForStage(stage?: string | null): Career[] {
  if (!stage) return [...CAREERS].sort((a, b) => DEMAND_RANK[a.demandOutlook] - DEMAND_RANK[b.demandOutlook]);
  const close = CAREERS.filter((c) => careerMatchesStage(c, stage));
  const rest = CAREERS.filter((c) => !careerMatchesStage(c, stage)).sort(
    (a, b) => DEMAND_RANK[a.demandOutlook] - DEMAND_RANK[b.demandOutlook],
  );
  return [...close, ...rest];
}

function scholarshipMatchesStage(s: Scholarship, stage?: string | null): boolean {
  if (!stage) return true;
  if (s.appliesToQualification.includes(stage as QualificationId)) return true;
  const level = stageLevelOf(stage);
  if (!level) return false;
  const peers = LEVEL_STAGES[level];
  return s.appliesToQualification.some((q) => peers.includes(q));
}

export function isScholarshipCloseMatch(s: Scholarship, stage?: string | null): boolean {
  return scholarshipMatchesStage(s, stage);
}

/** Scholarships ordered for the stage: schemes open to it first, then the rest. */
export function scholarshipsForStage(stage?: string | null): Scholarship[] {
  if (!stage) return [...SCHOLARSHIPS];
  const close = SCHOLARSHIPS.filter((s) => scholarshipMatchesStage(s, stage));
  const rest = SCHOLARSHIPS.filter((s) => !scholarshipMatchesStage(s, stage));
  return [...close, ...rest];
}

export function isExamCloseMatch(exam: Exam, stage?: string | null): boolean {
  if (!stage) return true;
  const level = stageLevelOf(stage);
  const peers = level ? LEVEL_STAGES[level] : [];
  return exam.openTo.includes(stage as QualificationId) || exam.openTo.some((q) => peers.includes(q));
}

/** Exams a student at this stage can realistically attempt, closest first. */
export function examsForStage(stage?: string | null): Exam[] {
  if (!stage) return [...EXAMS].sort((a, b) => a.shortName.localeCompare(b.shortName));
  const level = stageLevelOf(stage);
  const peers = level ? LEVEL_STAGES[level] : [];
  const direct = EXAMS.filter((e) => e.openTo.includes(stage as QualificationId));
  const near = EXAMS.filter(
    (e) =>
      !direct.includes(e) &&
      (e.openTo.some((q) => peers.includes(q)) ||
        textHasAny(e.category, LEVEL_KEYWORDS[level ?? 'school'])),
  );
  const remaining = EXAMS.filter((e) => !direct.includes(e) && !near.includes(e));
  return [...direct, ...near, ...remaining].sort((a, b) => a.shortName.localeCompare(b.shortName));
}

/**
 * Skill tracks that fit this stage, ranked by interests then stage affinity.
 * All tracks stay in the list, so a student never sees an empty screen.
 */
const STAGE_SKILL_BOOST: Partial<Record<QualificationId, string[]>> = {
  'class12-commerce': ['business-finance'],
  diploma: ['electronics-hardware', 'web-dev'],
  iti: ['electronics-hardware'],
  'btech-student': ['web-dev', 'python-data'],
  'medical-student': ['healthcare-skills'],
  'b-ed-student': ['communication-media', 'govt-exam-prep'],
  undergraduate: ['python-data', 'web-dev', 'business-finance'],
  graduate: ['python-data', 'business-finance', 'communication-media'],
  postgraduate: ['python-data', 'communication-media', 'govt-exam-prep'],
};

export function skillTracksForStage(interests: string[], stage?: string | null): SkillTrack[] {
  const boost = stage ? STAGE_SKILL_BOOST[stage as QualificationId] ?? [] : [];
  const scored = SKILL_TRACKS.map((track) => {
    const interestHits = track.fits.filter((f) => interests.includes(f)).length;
    const boostPoints = boost.includes(track.id) ? 2 : 0;
    const healthPriority = stage === 'medical-student' && track.id === 'healthcare-skills' ? 3 : 0;
    return { track, score: interestHits * 3 + boostPoints + healthPriority };
  });
  return [...scored].sort((a, b) => b.score - a.score).map((s) => s.track);
}

/** Internships, apprenticeships and drives open to the stage, optionally typed. */
export function opportunitiesForStage(
  stage?: string | null,
  types?: Opportunity['type'][],
): Opportunity[] {
  const pool = stage ? opportunitiesFor(stage) : OPPORTUNITIES;
  const filtered = types && types.length > 0 ? pool.filter((o) => types.includes(o.type)) : pool;
  return filtered.length > 0 ? filtered : OPPORTUNITIES;
}

/** QA helper: what every stage actually sees on each screen. */
export function stageCoverage() {
  return QUALIFICATIONS.map((q) => {
    const guide = findStageGuide(q.id);
    return {
      stage: q.id,
      label: q.label,
      pathways: pathwaysForStage(q.id).length,
      careers: careersForStage(q.id).length,
      careersClose: CAREERS.filter((c) => isCareerCloseMatch(c, q.id)).length,
      scholarships: scholarshipsForStage(q.id).length,
      scholarshipsClose: SCHOLARSHIPS.filter((s) => isScholarshipCloseMatch(s, q.id)).length,
      exams: examsForStage(q.id).length,
      examsClose: EXAMS.filter((e) => isExamCloseMatch(e, q.id)).length,
      skills: skillTracksForStage([], q.id).length,
      opportunities: opportunitiesForStage(q.id).length,
      nextBest: guide?.nextBest.length ?? 0,
      checklist: guide?.placementChecklist?.length ?? 0,
      roadmapMilestones: guide ? guide.nextBest.length + 3 : 0,
    };
  });
}