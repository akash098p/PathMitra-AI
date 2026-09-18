'use client';

import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { PATHWAYS } from '@/data/pathways';
import { SKILL_TRACKS } from '@/data/skills';
import { SCHOLARSHIPS } from '@/data/scholarships';
import type { StudentProfile } from '@/lib/types';
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
}

function buildMilestones(profile: StudentProfile): Milestone[] {
  if (!profile.qualification) {
    return [
      {
        id: 'finish-onboarding',
        label: 'Finish your profile',
        detail: 'Set your current stage and interests so this checklist can be built.',
      },
    ];
  }

  const milestones: Milestone[] = [];

  milestones.push({
    id: 'confirm-stage',
    label: 'Confirm your current stage and subjects',
    detail:
      'Make sure the qualification chosen in Profile matches your real situation, because every recommendation depends on it.',
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
      label: `Read the full ${pathway.shortName} route`,
      detail: `${pathway.bestFor} Check its syllabus and the government versus private fee gap before shortlisting.`,
    });
    if (pathway.entranceExams.length > 0) {
      milestones.push({
        id: `exams-${pathway.id}`,
        label: `Note the entrance tests for ${pathway.shortName}`,
        detail:
          'Open each exam from the route page, verify the current-year dates on the official portal, and write the deadlines down.',
      });
    }
    milestones.push({
      id: `cost-${pathway.id}`,
      label: `Work out the family budget for ${pathway.shortName}`,
      detail: `Government version: ${pathway.cost.government}. Private version: ${pathway.cost.private}. Add travel, hostel and coaching where relevant.`,
    });
  }

  const relevantScholarship = SCHOLARSHIPS.find((s) =>
    profile.qualification ? s.appliesToQualification.includes(profile.qualification) : false,
  );
  if (relevantScholarship) {
    milestones.push({
      id: 'scholarship',
      label: `Check eligibility for ${relevantScholarship.name}`,
      detail: `${relevantScholarship.benefits} Keep the listed documents scanned and ready before the window opens.`,
    });
  }

  const track = SKILL_TRACKS.find((t) => t.fits.some((f) => profile.interests.includes(f)));
  if (track) {
    milestones.push({
      id: 'skill-weekly',
      label: `Give ${track.name} six hours this week`,
      detail: `Start with: ${track.milestones[0]} Aim for a first project within ${track.timeToFirstProject}.`,
    });
    milestones.push({
      id: 'skill-project',
      label: `Finish one small project in ${track.name}`,
      detail: `For example: ${track.beginnerProjects[0]} Publish it or photograph it so you can show it.`,
    });
  }

  milestones.push({
    id: 'talk-family',
    label: 'Discuss the shortlist with your family',
    detail: 'Use the What-if simulator to show timelines and costs, then agree on a first choice and a fallback.',
  });

  milestones.push({
    id: 'advisor-questions',
    label: 'Ask the advisor your remaining doubts',
    detail: 'Anything unanswered — fees, hostels, a specific exam — can be asked directly in the Advisor tab.',
  });

  return milestones;
}

export function RoadmapScreen({
  profile,
  onToggleMilestone,
}: {
  profile: StudentProfile;
  onToggleMilestone: (id: string) => void;
}) {
  const milestones = buildMilestones(profile);
  const done = milestones.filter((m) => profile.completedMilestones.includes(m.id)).length;
  const progress = milestones.length ? Math.round((done / milestones.length) * 100) : 0;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Your step-by-step roadmap</h2>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          Built from your stage, saved routes and interests. Ticks are saved on this device, so your progress stays.
        </p>
      </div>

      {milestones[0].id === 'finish-onboarding' ? (
        <EmptyState title="Your roadmap starts with your profile" body="Complete onboarding so the steps can be generated." />
      ) : null}

      {milestones[0].id !== 'finish-onboarding' ? (
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

      <div className="space-y-2">
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
      </div>

      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
        Progress is saved only in this browser. Tap any step to tick or untick it.
      </p>
    </div>
  );
}