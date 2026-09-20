'use client';

import React from 'react';
import { ArrowDown, CheckCircle2, Circle, Flag, Route, Wallet } from 'lucide-react';
import { PATHWAYS } from '@/data/pathways';
import { SKILL_TRACKS } from '@/data/skills';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { findExam } from '@/data/exams';
import { findStageGuide } from '@/data/nextsteps';
import { QUALIFICATIONS } from '@/data/qualifications';
import {
  isScholarshipCloseMatch,
  pathwaysForStage,
  scholarshipsForStage,
  skillTracksForStage,
} from '@/lib/stagematch';
import type { NextStepCategory, QualificationId, StudentProfile } from '@/lib/types';
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

/** Realistic first-income timing, stage by stage. */
function firstIncomeFor(profile: StudentProfile): string {
  const stage = profile.qualification as QualificationId;
  if (stage === 'btech-student') {
    return 'During the final year through internships, placements, freelance work or graduate engineer roles';
  }
  if (stage === 'graduate' || stage === 'postgraduate') {
    return 'Immediately — through off-campus applications, hiring tests, converting internships and government exam cycles';
  }
  if (stage === 'medical-student') {
    return 'From the internship year onward — government medical posts, hospital roles or stipend-supported PG training';
  }
  if (stage === 'b-ed-student') {
    return 'After teaching practice through TET/CTET, school recruitment, tutoring or education roles';
  }
  if (stage === 'diploma') {
    return 'Within months of finishing — JE exams, apprenticeship stipends or technician jobs';
  }
  if (stage === 'iti') {
    return 'Right after the trade — apprenticeship stipend, technician recruitment or workshop work';
  }
  if (stage === 'undergraduate') {
    return 'In the final year through internships, off-campus tests and entry-level roles';
  }
  return stage === 'class10' || stage === 'class11'
    ? 'Around age 18–21 through entry jobs, apprenticeships or a short professional course'
    : 'Around age 21–23 after the first degree or professional qualification';
}

/** Timeline phases, mapped from the type of next move. */
const PHASE_BY_CATEGORY: Record<NextStepCategory, string> = {
  job: 'Apply',
  placement: 'Placements',
  internship: 'Experience',
  exam: 'Prepare',
  'higher-study': 'Study',
  skill: 'Build',
};

function buildPlan(profile: StudentProfile): RoadmapPlan | null {
  if (!profile.qualification) return null;

  const guide = findStageGuide(profile.qualification);
  const qualification = QUALIFICATIONS.find((q) => q.id === profile.qualification);
  if (!guide) return null;

  // Course routes only exist for stages that are still choosing a course. For an
  // already-qualified student the plan is built from their stage playbook, which
  // is why a medical, degree or postgraduate student now gets a real roadmap.
  const stagePathways = pathwaysForStage(profile.qualification);
  const chosenRoute = stagePathways.find((p) => profile.savedPathways.includes(p.id)) ?? stagePathways[0];
  const tracks = skillTracksForStage(profile.interests, profile.qualification);
  const funding = scholarshipsForStage(profile.qualification).filter((s) =>
    isScholarshipCloseMatch(s, profile.qualification),
  );
  const trackedExams = guide.govtExams
    .map((id) => findExam(id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const firstIncome = firstIncomeFor(profile);
  const examText = chosenRoute && chosenRoute.entranceExams.length
    ? `Track ${chosenRoute.entranceExams.slice(0, 2).map((id) => id.toUpperCase()).join(' and ')} dates plus the exams listed for your stage.`
    : trackedExams.length
      ? `Track ${trackedExams.slice(0, 2).map((e) => e.shortName).join(' and ')} — verify current dates on the official portals.`
      : 'Shortlist nearby government and private institutes, then verify recognition, placement records and total fees.';

  const stages: Milestone[] = [
    {
      id: 'confirm-stage',
      phase: 'Now',
      timing: 'This week',
      label: `Confirm your stage: ${qualification?.label ?? 'set it in Profile'}`,
      detail: 'Every match, exam and move on this page depends on this being accurate. Update it in Profile if anything changed.',
      outcome: 'A roadmap that matches reality',
    },
    ...guide.nextBest.map((card) => ({
      id: `move-${card.id}`,
      phase: PHASE_BY_CATEGORY[card.category] ?? 'Move',
      timing: card.timeline,
      label: card.title,
      detail: `${card.why} Start with: ${card.actions[0]}`,
      outcome: card.actions[card.actions.length - 1],
    })),
    ...(trackedExams.length > 0
      ? [
          {
            id: 'exam-watch',
            phase: 'Prepare',
            timing: trackedExams[0].cycleWindow,
            label: `Track ${trackedExams.slice(0, 2).map((e) => e.shortName).join(' and ')}`,
            detail: 'File the application the day the window opens and keep every document scanned in one folder.',
            outcome: 'Applications filed on time',
          },
        ]
      : []),
    ...(funding.length > 0
      ? [
          {
            id: 'funding',
            phase: 'Fund',
            timing: funding[0].window,
            label: `Apply for ${funding[0].name}`,
            detail: `${funding[0].benefits} Keep ready: ${funding[0].documents.slice(0, 3).join(', ')}.`,
            outcome: 'Fees covered where eligible',
          },
        ]
      : []),
    ...(chosenRoute
      ? [
          {
            id: `route-${chosenRoute.id}`,
            phase: 'Study',
            timing: 'Before applications open',
            label: `Lock your route: ${chosenRoute.shortName}`,
            detail: `${chosenRoute.durationLabel} · Government cost ${chosenRoute.cost.government} · ${examText}`,
            outcome: 'A first choice and a fallback',
          },
        ]
      : []),
    {
      id: `skill-${tracks[0].id}`,
      phase: 'Build',
      timing: tracks[0].weeklyHours,
      label: `Start the ${tracks[0].name} track`,
      detail: `Milestone one: ${tracks[0].milestones[0]} First project: ${tracks[0].beginnerProjects[0]}`,
      outcome: 'A portfolio piece with a public link',
    },
    {
      id: 'review-progress',
      phase: 'Review',
      timing: 'Every 4 weeks',
      label: 'Review progress with evidence',
      detail: 'Check marks, skill progress, real job demand and the family budget. Changing direction early is planning, not failure.',
      outcome: 'A plan that stays honest',
    },
  ];

  return {
    title: `${qualification?.label ?? 'Your'} plan`,
    summary: guide.headline,
    firstIncome,
    stages,
    alternatives: guide.nextBest.slice(1, 3).map((c) => c.title),
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