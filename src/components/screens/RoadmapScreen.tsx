'use client';

import React from 'react';
import { ArrowDown, CheckCircle2, Circle, Flag, Route, Wallet } from 'lucide-react';
import { PATHWAYS } from '@/data/pathways';
import { SKILL_TRACKS } from '@/data/skills';
import { SCHOLARSHIPS } from '@/data/scholarships';
import type { QualificationId, StudentProfile } from '@/lib/types';
import { Card, EmptyState, Meter, SectionTitle, Tag } from '@/components/ui';

// ============================================================================
// Roadmap — a personal checklist derived from the student's own stage and
// chosen routes. Milestones persist in local storage, so progress survives
// across visits.
// ============================================================================

interface Milestone {
  id: string;
  label: string;
  detail: string;
  phase: string;
  timing: string;
  outcome: string;
}

interface RoadmapPlan {
  title: string;
  summary: string;
  firstIncome: string;
  stages: Milestone[];
  alternatives: string[];
}

function buildPlan(profile: StudentProfile): RoadmapPlan | null {
  if (!profile.qualification) return null;

  const eligible = PATHWAYS.filter((p) => p.startsAfter.includes(profile.qualification as QualificationId));
  const ranked = [...eligible].sort((a, b) => {
    const aScore = a.fits.filter((interest) => profile.interests.includes(interest)).length;
    const bScore = b.fits.filter((interest) => profile.interests.includes(interest)).length;
    return bScore - aScore;
  });
  const saved = profile.savedPathways.filter((id) => eligible.some((p) => p.id === id));
  const ordered = [
    ...saved.map((id) => eligible.find((p) => p.id === id)).filter((p): p is (typeof PATHWAYS)[number] => Boolean(p)),
    ...ranked.filter((p) => !saved.includes(p.id)),
  ];
  const primary = ordered[0];
  if (!primary) return null;

  const firstIncome = primary.durationYears <= 3
    ? `Around age ${profile.qualification === 'class10' ? 18 : 20}–21 through entry jobs, apprenticeships or internships`
    : `Usually around age ${profile.qualification === 'class10' ? 22 : 24} after the first degree or professional qualification`;
  const examText = primary.entranceExams.length
    ? `Check ${primary.entranceExams.slice(0, 2).map((id) => id.toUpperCase()).join(' and ')} dates on the official portals and make a second-choice college list.`
    : 'Shortlist nearby government and private institutes, then verify recognition, placement records and total fees.';

  const stages: Milestone[] = [
    {
      id: 'confirm-stage',
      phase: 'Now',
      timing: 'This week',
      label: 'Confirm your starting point',
      detail: `Check that ${profile.qualification === 'class10' ? 'Class 10' : 'your current qualification'} and your subjects match the route. Speak with one teacher or counsellor before committing.`,
      outcome: 'A realistic entry point',
    },
    {
      id: `choose-${primary.id}`,
      phase: 'Choose',
      timing: 'Next 2–4 weeks',
      label: `Shortlist ${primary.shortName}`,
      detail: `${primary.bestFor} Compare the government and private versions, travel distance, hostel needs and the full cost rather than tuition alone.`,
      outcome: 'One primary route and one fallback',
    },
    {
      id: `prepare-${primary.id}`,
      phase: 'Prepare',
      timing: profile.qualification === 'class10' ? 'Next 3–6 months' : 'Before applications open',
      label: 'Prepare for admission',
      detail: `${examText} Keep marksheets, certificates, photographs and income or category documents ready in one folder.`,
      outcome: 'Applications submitted on time',
    },
    {
      id: `build-${primary.id}`,
      phase: 'Build',
      timing: `During ${primary.durationLabel.toLowerCase()}`,
      label: 'Build proof of skill alongside study',
      detail: `Complete practical work from the syllabus, one small project each term and a short internship or apprenticeship when possible.`,
      outcome: 'Portfolio, references and confidence',
    },
    {
      id: `earn-${primary.id}`,
      phase: 'Launch',
      timing: 'Final year and after',
      label: 'Test the job market before graduating',
      detail: `Apply to entry roles related to ${primary.shortName}, compare real offers and keep higher study or a government exam as an informed backup.`,
      outcome: firstIncome,
    },
    {
      id: 'review-route',
      phase: 'Review',
      timing: 'Every 6 months',
      label: 'Review the route with evidence',
      detail: 'Check marks, skill progress, family budget and actual job demand. Change direction early if the evidence changes, without treating it as failure.',
      outcome: 'A route that stays realistic',
    },
  ];

  return {
    title: `${primary.shortName} career journey`,
    summary: `A practical route from ${profile.qualification === 'class10' ? 'your current Class 10 stage' : 'your current stage'} to study, first work experience and a sustainable career.`,
    firstIncome,
    stages,
    alternatives: ordered.slice(1, 3).map((p) => p.shortName),
  };
}

function buildMilestones(profile: StudentProfile): Milestone[] {
  if (!profile.qualification) {
    return [
      {
        id: 'finish-onboarding',
        phase: 'Start',
        timing: 'First step',
        label: 'Finish your profile',
        detail: 'Set your current stage and interests so this checklist can be built.',
        outcome: 'A personalised roadmap',
      },
    ];
  }

  const milestones: Milestone[] = [];

  milestones.push({
    id: 'confirm-stage',
    phase: 'Now',
    timing: 'This week',
    label: 'Confirm your current stage and subjects',
    detail:
      'Make sure the qualification chosen in Profile matches your real situation, because every recommendation depends on it.',
      outcome: 'A realistic starting point',
  });

  const saved = profile.savedPathways.length
    ? profile.savedPathways
    : PATHWAYS.filter((p) => p.fits.some((f) => profile.interests.includes(f)))
        .slice(0, 2)
        .map((p) => p.id);

  for (const id of saved.slice(0, 2)) {
    const pathway = PATHWAYS.find((p) => p.id === id);
    if (!pathway) continue;
    milestones.push({
      id: `read-${pathway.id}`,
      phase: 'Choose',
      timing: 'Next 2–4 weeks',
      label: `Read the full ${pathway.shortName} route`,
      detail: `${pathway.bestFor} Check its syllabus and the government versus private fee gap before shortlisting.`,
      outcome: 'A route worth exploring',
    });
    if (pathway.entranceExams.length > 0) {
      milestones.push({
        id: `exams-${pathway.id}`,
        phase: 'Prepare',
        timing: 'Before applications open',
        label: `Note the entrance tests for ${pathway.shortName}`,
        detail:
          'Open each exam from the route page, verify the current-year dates on the official portal, and write the deadlines down.',
        outcome: 'No missed deadline',
      });
    }
    milestones.push({
      id: `cost-${pathway.id}`,
      phase: 'Plan',
      timing: 'Before paying fees',
      label: `Work out the family budget for ${pathway.shortName}`,
      detail: `Government version: ${pathway.cost.government}. Private version: ${pathway.cost.private}. Add travel, hostel and coaching where relevant.`,
      outcome: 'A family budget and fallback',
    });
  }

  const relevantScholarship = SCHOLARSHIPS.find((s) =>
    profile.qualification ? s.appliesToQualification.includes(profile.qualification) : false,
  );
  if (relevantScholarship) {
    milestones.push({
      id: 'scholarship',
      phase: 'Fund',
      timing: 'Before admission',
      label: `Check eligibility for ${relevantScholarship.name}`,
      detail: `${relevantScholarship.benefits} Keep the listed documents scanned and ready before the window opens.`,
      outcome: 'Lower financial pressure',
    });
  }

  const track = SKILL_TRACKS.find((t) => t.fits.some((f) => profile.interests.includes(f)));
  if (track) {
    milestones.push({
      id: 'skill-weekly',
      phase: 'Build',
      timing: 'This month',
      label: `Give ${track.name} six hours this week`,
      detail: `Start with: ${track.milestones[0]} Aim for a first project within ${track.timeToFirstProject}.`,
      outcome: 'A useful skill habit',
    });
    milestones.push({
      id: 'skill-project',
      phase: 'Build',
      timing: 'Next 1–3 months',
      label: `Finish one small project in ${track.name}`,
      detail: `For example: ${track.beginnerProjects[0]} Publish it or photograph it so you can show it.`,
      outcome: 'Proof you can show',
    });
  }

  milestones.push({
    id: 'talk-family',
    phase: 'Decide',
    timing: 'After comparing routes',
    label: 'Discuss the shortlist with your family',
    detail: 'Use the What-if simulator to show timelines and costs, then agree on a first choice and a fallback.',
    outcome: 'A shared decision',
  });

  milestones.push({
    id: 'advisor-questions',
    phase: 'Review',
    timing: 'Whenever uncertain',
    label: 'Ask the advisor your remaining doubts',
    detail: 'Anything unanswered — fees, hostels, a specific exam — can be asked directly in the Advisor tab.',
    outcome: 'Fewer unknowns',
  });

  return milestones;
}

export function RoadmapScreen({
  profile,
  onToggleMilestone,
  onBack,
}: {
  profile: StudentProfile;
  onToggleMilestone: (id: string) => void;
  onBack?: () => void;
}) {
  const milestones = buildMilestones(profile);
  const plan = buildPlan(profile);
  const progressMilestones = plan?.stages ?? milestones;
  const done = progressMilestones.filter((m) => profile.completedMilestones.includes(m.id)).length;
  const progress = progressMilestones.length ? Math.round((done / progressMilestones.length) * 100) : 0;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between">
          Your step-by-step roadmap
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="text-[9px] text-indigo-600 font-semibold hover:text-indigo-800 transition mt-1"
            >
              Back
            </button>
          ) : null}
        </h2>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          Built from your stage, saved routes and interests. Ticks are saved on this device, so your progress stays.
        </p>
      </div>

      {plan ? (
        <>
          <Card className="!bg-indigo-950 !text-white border-indigo-900 shadow-none">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-white/10 text-indigo-200 shrink-0">
                <Route className="w-4 h-4" />
              </span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-200">Real-life route plan</p>
                <h2 className="text-sm font-bold mt-0.5">{plan.title}</h2>
                <p className="text-[10px] text-indigo-100/80 leading-relaxed mt-1">{plan.summary}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="rounded-xl bg-white/10 p-2.5">
                <Wallet className="w-3.5 h-3.5 text-amber-300 mb-1" />
                <p className="text-[9px] text-indigo-200">First income signal</p>
                <p className="text-[10px] font-semibold leading-relaxed mt-0.5">{plan.firstIncome}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-2.5">
                <Flag className="w-3.5 h-3.5 text-emerald-300 mb-1" />
                <p className="text-[9px] text-indigo-200">Fallback route</p>
                <p className="text-[10px] font-semibold leading-relaxed mt-0.5">
                  {plan.alternatives[0] ?? 'Keep one affordable route open'}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-200">Journey progress</span>
                <span className="text-[10px] font-bold text-white">{done} of {progressMilestones.length}</span>
              </div>
              <Meter value={progress} tone={progress === 100 ? 'emerald' : 'indigo'} />
            </div>
          </Card>

          <div className="space-y-0">
            {plan.stages.map((stage, index) => {
              const complete = profile.completedMilestones.includes(stage.id);
              return (
                <React.Fragment key={stage.id}>
                  <Card
                    onClick={() => onToggleMilestone(stage.id)}
                    className={`relative flex gap-3 items-start rounded-2xl ${complete ? 'border-emerald-200 bg-emerald-50/40' : ''}`}
                  >
                    <div className="relative z-10 shrink-0">
                      {complete ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-indigo-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600">{stage.phase}</span>
                        <span className="text-[9px] text-slate-400">{stage.timing}</span>
                      </div>
                      <h3 className={`text-xs font-bold mt-1 ${complete ? 'text-emerald-800' : 'text-slate-900'}`}>
                        {stage.label}
                      </h3>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1">{stage.detail}</p>
                      <p className="text-[9px] font-semibold text-slate-400 mt-2">Outcome: {stage.outcome}</p>
                    </div>
                  </Card>
                  {index < plan.stages.length - 1 ? (
                    <div className="flex justify-center h-5">
                      <ArrowDown className="w-4 h-4 text-indigo-300" />
                    </div>
                  ) : null}
                </React.Fragment>
              );
            })}
          </div>
        </>
      ) : null}

      {!plan && milestones[0].id === 'finish-onboarding' ? (
        <EmptyState title="Your roadmap starts with your profile" body="Complete onboarding so the steps can be generated." />
      ) : null}

      {!plan && milestones[0].id !== 'finish-onboarding' ? (
        <Card>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Progress</span>
            <span className="text-[11px] font-bold text-indigo-600">
              {done} of {milestones.length}
            </span>
          </div>
          <Meter value={progress} tone={progress === 100 ? 'emerald' : 'indigo'} />
        </Card>
      ) : null}

      {!plan ? <div className="space-y-2">
        {milestones.map((milestone, i) => {
          const complete = profile.completedMilestones.includes(milestone.id);
          return (
            <Card
              key={milestone.id}
              onClick={() => onToggleMilestone(milestone.id)}
              className={`flex gap-3 items-start ${complete ? 'opacity-70' : ''}`}
            >
              {complete ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-slate-400">STEP {i + 1}</span>
                  {complete ? <Tag tone="emerald">done</Tag> : null}
                </div>
                <h4
                  className={`text-[11px] font-bold mt-0.5 ${
                    complete ? 'text-slate-400 line-through' : 'text-slate-900'
                  }`}
                >
                  {milestone.label}
                </h4>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{milestone.detail}</p>
              </div>
            </Card>
          );
        })}
      </div> : null}

      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
        Progress is saved only in this browser. Tap any stage to tick or untick it.
      </p>
    </div>
  );
}