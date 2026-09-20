import type {
  BudgetBand,
  Mobility,
  PriorityId,
  RiskAppetite,
  StudentProfile,
} from '@/lib/types';

// ============================================================================
// Student profile — nothing about the user is assumed. The app starts blank
// and the onboarding flow fills this in, then it is persisted in the browser.
// ============================================================================

export const PROFILE_STORAGE_KEY = 'pathmitra.profile.v2';

export const EMPTY_PROFILE: StudentProfile = {
  name: '',
  age: '',
  gender: '',
  qualification: '',
  interests: [],
  budget: 'any',
  mobility: 'same-state',
  risk: 'balanced',
  priorities: [],
  completedMilestones: [],
  savedPathways: [],
  savedExams: [],
  savedOpportunities: [],
  onboarded: false,
};

export function loadProfile(): StudentProfile {
  if (typeof window === 'undefined') return EMPTY_PROFILE;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return EMPTY_PROFILE;
    const parsed = JSON.parse(raw) as Partial<StudentProfile>;
    return { ...EMPTY_PROFILE, ...parsed };
  } catch {
    return EMPTY_PROFILE;
  }
}

export function saveProfile(profile: StudentProfile): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Storage can be blocked (private mode, full quota) — the app still works
    // for the current session because state lives in React.
  }
}

export function clearProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function addMilestone(profile: StudentProfile, milestoneId: string): StudentProfile {
  if (profile.completedMilestones.includes(milestoneId)) return profile;
  return { ...profile, completedMilestones: [...profile.completedMilestones, milestoneId] };
}

export function toggleMilestone(profile: StudentProfile, milestoneId: string): StudentProfile {
  const done = profile.completedMilestones.includes(milestoneId);
  return {
    ...profile,
    completedMilestones: done
      ? profile.completedMilestones.filter((m) => m !== milestoneId)
      : [...profile.completedMilestones, milestoneId],
  };
}

export function toggleSavedPathway(profile: StudentProfile, pathwayId: StudentProfile['savedPathways'][number]): StudentProfile {
  const saved = profile.savedPathways.includes(pathwayId);
  return {
    ...profile,
    savedPathways: saved
      ? profile.savedPathways.filter((p) => p !== pathwayId)
      : [...profile.savedPathways, pathwayId],
  };
}

export const BUDGET_LABELS: Record<BudgetBand, string> = {
  low: 'Under ₹25,000 per year',
  medium: '₹25,000 – ₹1 lakh per year',
  high: 'Above ₹1 lakh per year is feasible',
  any: 'Not decided yet',
};

export const MOBILITY_LABELS: Record<Mobility, string> = {
  'home-only': 'Must stay at home in my town',
  'same-state': 'Can move within my state',
  anywhere: 'Can move anywhere in India',
};

export const RISK_LABELS: Record<RiskAppetite, string> = {
  safe: 'Prefer a safe, steady route',
  balanced: 'Balanced — some risk is fine',
  ambitious: 'Aim high even if it is competitive',
};

export const PRIORITY_LABELS: Record<PriorityId, string> = {
  'low-fees': 'Keeping fees as low as possible',
  'quick-earning': 'Starting to earn soon',
  'govt-job': 'A government job',
  'high-salary': 'High private-sector salary',
  'nearby-college': 'Studying near home',
  'higher-studies': 'Keeping higher studies open',
  'respect-family': 'A career the family respects',
};

/** A human summary of the profile, used by the advisor and the results screen. */
export function describeProfile(profile: StudentProfile): string {
  const bits: string[] = [];
  if (profile.qualification) bits.push(`qualification: ${profile.qualification}`);
  if (profile.interests.length) bits.push(`interests: ${profile.interests.join(', ')}`);
  bits.push(`budget: ${BUDGET_LABELS[profile.budget]}`);
  bits.push(`mobility: ${MOBILITY_LABELS[profile.mobility]}`);
  bits.push(`risk appetite: ${RISK_LABELS[profile.risk]}`);
  if (profile.priorities.length) {
    bits.push(`priorities: ${profile.priorities.map((p) => PRIORITY_LABELS[p]).join(', ')}`);
  }
  return bits.join(' | ');
}

export function toggleSavedExam(profile: StudentProfile, examId: string): StudentProfile {
  const saved = profile.savedExams.includes(examId);
  return {
    ...profile,
    savedExams: saved ? profile.savedExams.filter((id) => id !== examId) : [...profile.savedExams, examId],
  };
}

export function toggleSavedOpportunity(profile: StudentProfile, opportunityId: string): StudentProfile {
  const saved = profile.savedOpportunities.includes(opportunityId);
  return {
    ...profile,
    savedOpportunities: saved
      ? profile.savedOpportunities.filter((id) => id !== opportunityId)
      : [...profile.savedOpportunities, opportunityId],
  };
}