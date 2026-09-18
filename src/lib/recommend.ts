import { PATHWAYS } from '@/data/pathways';
import { QUALIFICATIONS } from '@/data/qualifications';
import { INTERESTS } from '@/data/qualifications';
import type { Pathway, QualificationId, Recommendation, StudentProfile } from '@/lib/types';

// ============================================================================
// Explainable recommendation engine.
// Every score is built from visible factors, and the reasons/cautions arrays
// are shown to the student and parent so the advice is never a black box.
// ============================================================================

const LOW_COST_HINTS = ['₹500', '₹1,000', '₹1,500', '₹3,000', '₹5,000'];

function qualificationOf(profile: StudentProfile): QualificationId | null {
  return (profile.qualification || null) as QualificationId | null;
}

function isCheapPathway(pathway: Pathway): boolean {
  return LOW_COST_HINTS.some((hint) => pathway.cost.government.includes(hint));
}

export function scorePathways(profile: StudentProfile, limit = 4): Recommendation[] {
  const qualification = qualificationOf(profile);
  const qualificationMeta = QUALIFICATIONS.find((q) => q.id === qualification);
  const allowed = qualificationMeta
    ? new Set(qualificationMeta.canChoose)
    : new Set(PATHWAYS.map((p) => p.id));

  const results: Recommendation[] = [];

  for (const pathway of PATHWAYS) {
    if (!allowed.has(pathway.id)) continue;

    let score = 34; // baseline so every eligible path is presentable
    const reasons: string[] = [];
    const cautions: string[] = [];

    // --- interest alignment -------------------------------------------------
    const interestHits = pathway.fits.filter((f) => profile.interests.includes(f));
    if (interestHits.length > 0) {
      const bonus = Math.min(30, interestHits.length * 12);
      score += bonus;
      reasons.push(
        `Matches ${interestHits.length} of your stated interests: ${interestHits
          .map((i) => INTERESTS[i]?.label ?? i)
          .join(', ')}.`,
      );
    }

    // --- risk alignment -----------------------------------------------------
    if (profile.risk === 'safe') {
      if (pathway.risk === 'safe') {
        score += 12;
        reasons.push('A steady route with a lower failure cost — this fits your preference for safety.');
      } else if (pathway.risk === 'ambitious') {
        score -= 10;
        cautions.push('This is a high-competition route, so the fallback plan needs to be decided up front.');
      }
    } else if (profile.risk === 'ambitious') {
      if (pathway.risk === 'ambitious') {
        score += 8;
        reasons.push('High-ceiling route that rewards the effort you are willing to put in.');
      }
    } else if (pathway.risk === 'balanced') {
      score += 6;
    }

    // --- budget -------------------------------------------------------------
    if (profile.budget === 'low') {
      if (isCheapPathway(pathway)) {
        score += 14;
        reasons.push('Government fees on this route are among the lowest available in India.');
      } else {
        score -= 6;
        cautions.push('Private-college fees on this route are high — a government seat or a scholarship is essential.');
      }
    } else if (profile.budget === 'high' && pathway.risk === 'ambitious') {
      score += 4;
    }

    // --- family priorities --------------------------------------------------
    if (profile.priorities.includes('govt-job')) {
      const govtStrength = pathway.govtJobs.length;
      score += Math.min(10, govtStrength * 3);
      if (govtStrength >= 3) {
        reasons.push('Opens several government recruitment routes, which matters for the family priority of a secure job.');
      }
    }
    if (profile.priorities.includes('quick-earning')) {
      if (pathway.durationYears <= 2) {
        score += 14;
        reasons.push(`Short route — about ${pathway.durationLabel}, so earning can start early.`);
      } else if (pathway.durationYears >= 4) {
        score -= 6;
        cautions.push('A long study period before the first salary — plan family finances accordingly.');
      }
    }
    if (profile.priorities.includes('higher-studies')) {
      if (pathway.nextSteps.length >= 4) {
        score += 8;
        reasons.push('Keeps a wide range of higher-study options open.');
      }
    }
    if (profile.priorities.includes('low-fees') && isCheapPathway(pathway)) {
      score += 6;
    }
    if (profile.priorities.includes('nearby-college') && pathway.startsAfter.includes('class10')) {
      reasons.push('Available in most districts, so staying near home is realistic.');
    }
    if (profile.priorities.includes('high-salary') && pathway.privateJobs.length >= 3) {
      score += 6;
      reasons.push('Has a strong private-sector hiring base with visible salary growth.');
    }
    if (profile.priorities.includes('respect-family') && pathway.govtJobs.length >= 3) {
      score += 4;
    }

    // --- honest caution always present -------------------------------------
    if (pathway.cons.length > 0) {
      cautions.push(pathway.cons[0]);
    }
    if (reasons.length === 0) {
      reasons.push(`Eligible from your current stage — ${pathway.bestFor}`);
    }

    const finalScore = Math.max(12, Math.min(99, Math.round(score)));
    results.push({ pathway, score: finalScore, reasons, cautions });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Single-pathway fit used on detail screens. */
export function fitForPathway(profile: StudentProfile, pathway: Pathway): number {
  const found = scorePathways(profile, PATHWAYS.length).find((r) => r.pathway.id === pathway.id);
  return found?.score ?? 50;
}

export function topInterestLabel(profile: StudentProfile): string {
  const first = profile.interests[0];
  return first ? INTERESTS[first]?.label ?? 'your interests' : 'your interests';
}