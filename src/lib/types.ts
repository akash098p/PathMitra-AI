// ============================================================================
// PathMitra AI — core domain types
// Every dataset, screen and engine in the app is typed against this file so the
// guidance stays explainable, consistent and easy to extend.
// ============================================================================

export type QualificationId =
  | 'class10'
  | 'class12-science'
  | 'class12-commerce'
  | 'class12-arts'
  | 'diploma'
  | 'iti'
  | 'undergraduate';

export type InterestId =
  | 'coding'
  | 'medicine'
  | 'defence'
  | 'business'
  | 'design'
  | 'govt-service'
  | 'hands-on'
  | 'research'
  | 'media'
  | 'law'
  | 'agriculture'
  | 'teaching';

export type BudgetBand = 'low' | 'medium' | 'high' | 'any';
export type Mobility = 'home-only' | 'same-state' | 'anywhere';
export type RiskAppetite = 'safe' | 'balanced' | 'ambitious';
export type Sector = 'govt' | 'private' | 'both';

export type PathwayId =
  | 'science-pcm'
  | 'science-pcb'
  | 'commerce-ip'
  | 'arts-humanities'
  | 'polytechnic'
  | 'iti'
  | 'bca'
  | 'paramedical';

export type PriorityId =
  | 'low-fees'
  | 'quick-earning'
  | 'govt-job'
  | 'high-salary'
  | 'nearby-college'
  | 'higher-studies'
  | 'respect-family';

export interface Link {
  label: string;
  url: string;
}

export interface Qualification {
  id: QualificationId;
  label: string;
  emoji: string;
  helper: string;
  /** Pathways this qualification can realistically enter next. */
  canChoose: PathwayId[];
}

export interface Pathway {
  id: PathwayId;
  name: string;
  shortName: string;
  emoji: string;
  durationLabel: string;
  durationYears: number;
  startsAfter: QualificationId[];
  eligibility: string;
  /** Core subjects, for the "what will I actually study" view. */
  syllabus: string[];
  boards: string[];
  cost: { government: string; private: string };
  /** Exam ids from src/data/exams.ts */
  entranceExams: string[];
  /** Degrees / routes this pathway unlocks. */
  nextSteps: string[];
  govtJobs: string[];
  privateJobs: string[];
  pros: string[];
  cons: string[];
  risk: RiskAppetite;
  bestFor: string;
  /** Interests that score well against this pathway (used by the engine). */
  fits: InterestId[];
  links: Link[];
}
export type ExamLevel = 'national' | 'state' | 'institute';

export interface Exam {
  id: string;
  name: string;
  shortName: string;
  category: string;
  level: ExamLevel;
  conductedBy: string;
  officialUrl: string;
  eligibility: string;
  grants: string;
  /** Month window when the cycle usually runs — always verify on the portal. */
  cycleWindow: string;
  /** Which qualifications may attempt this exam. */
  openTo: QualificationId[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  prepMonths: number;
  /** State codes from src/data/states.ts, empty for all-India exams. */
  states: string[];
  notes: string;
  /** Pathway ids this exam unlocks. */
  unlocks: PathwayId[];
}

export interface Career {
  id: string;
  title: string;
  sector: Sector;
  emoji: string;
  entryPathways: PathwayId[];
  /** Minimum qualification in plain words, for parents. */
  minimumQualification: string;
  /** Realistic starting range in India. */
  startingBand: string;
  /** Range after 5–8 years of proven work. */
  experiencedBand: string;
  growthPath: string[];
  hiringBodies: string[];
  demandOutlook: 'very high' | 'high' | 'steady' | 'competitive';
  /** Honest stability note for parents. */
  parentNote: string;
}

export interface StateInfo {
  code: string;
  name: string;
  schoolBoards: string[];
  /** Technical / vocational board running polytechnic & ITI admissions. */
  technicalBoard: string;
  /** Official portals a student or parent should bookmark. */
  portals: Link[];
  /** Exam ids from src/data/exams.ts that are state-specific. */
  keyExams: string[];
  languages: string[];
  notes: string;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  eligibility: string;
  /** Annual family income ceiling stated by the scheme. */
  incomeCeiling: string;
  benefits: string;
  appliesToQualification: QualificationId[];
  portal: Link;
  /** Typical application window — verify on the portal. */
  window: string;
  documents: string[];
  level: 'central' | 'state' | 'institute';
}

export interface SkillTrack {
  id: string;
  name: string;
  emoji: string;
  fits: InterestId[];
  /** What a student can realistically do right now, with no degree yet. */
  milestones: string[];
  beginnerProjects: string[];
  resources: Link[];
  outcomeRoles: string[];
  weeklyHours: string;
  timeToFirstProject: string;
}

export interface Opportunity {
  id: string;
  name: string;
  type:
    | 'apprenticeship'
    | 'internship'
    | 'competition'
    | 'olympiad'
    | 'scholarship-test'
    | 'community';
  provider: string;
  eligibility: string;
  stipend: string;
  portal: Link;
  openTo: QualificationId[];
  notes: string;
}

export interface InterestQuestion {
  id: string;
  prompt: string;
  options: {
    label: string;
    /** Weighted interests this answer signals. */
    interests: InterestId[];
    emoji: string;
  }[];
}

export interface StudentProfile {
  /** Optional display name — the app never assumes one. */
  name: string;
  age?: string;
  gender?: string;
  qualification: QualificationId | '';
  interests: InterestId[];
  budget: BudgetBand;
  mobility: Mobility;
  risk: RiskAppetite;
  /** What the family cares about most (parent-alignment signals). */
  priorities: PriorityId[];
  completedMilestones: string[];
  savedPathways: PathwayId[];
  onboarded: boolean;
}

export interface Recommendation {
  pathway: Pathway;
  /** 0–100 fit score. */
  score: number;
  reasons: string[];
  cautions: string[];
}

export interface ScenarioStep {
  label: string;
  detail: string;
  years: number;
  cost: string;
}

export interface Scenario {
  id: string;
  title: string;
  emoji: string;
  summary: string;
  steps: ScenarioStep[];
  totalYears: number;
  costLow: number;
  costHigh: number;
  /** Age at which the student typically starts earning in this route. */
  firstEarningAge: number;
  upsides: string[];
  downsides: string[];
}
