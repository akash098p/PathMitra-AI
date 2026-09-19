'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { RotateCcw, Heart } from 'lucide-react';
import { QUALIFICATIONS, INTERESTS } from '@/data/qualifications';
import { PATHWAYS } from '@/data/pathways';
import { BUDGET_LABELS, MOBILITY_LABELS, PRIORITY_LABELS, RISK_LABELS, clearProfile } from '@/lib/profile';
import type { BudgetBand, Mobility, PriorityId, RiskAppetite, StudentProfile } from '@/lib/types';
import { Card, Chip, SectionTitle, Tag } from '@/components/ui';

// ============================================================================
// Profile — where the student reviews and edits everything the app knows, and
// can reset it completely. Nothing here is mandatory and nothing is sent
// anywhere except inside the advisor request context.
// ============================================================================

const PRIORITY_IDS: PriorityId[] = [
  'low-fees',
  'quick-earning',
  'govt-job',
  'high-salary',
  'nearby-college',
  'higher-studies',
  'respect-family',
];

export function ProfileScreen({
  profile,
  onUpdate,
  onRestart,
  hideAdvanced = false,
  onClose,
}: {
  profile: StudentProfile;
  onUpdate: (profile: StudentProfile) => void;
  onRestart: () => void;
  hideAdvanced?: boolean;
  onClose?: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [draft, setDraft] = useState(profile);
  const patch = (part: Partial<StudentProfile>) => {
    if (hideAdvanced) {
      setDraft((current) => ({ ...current, ...part }));
      return;
    }
    onUpdate({ ...profile, ...part });
  };

  function handleSaveAndClose() {
    onUpdate(draft);
    onClose?.();
  }

  function handleClear() {
    clearProfile();
    onRestart();
  }
  return (
    <div className="p-4 space-y-4">
      {hideAdvanced ? (
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Edit profile</p>
            <h1 className="text-base font-bold text-slate-900">{profile.name || 'Your profile'}</h1>
          </div>
          {onClose ? (
            <button type="button" onClick={onClose} className="text-[10px] font-semibold text-slate-500">
              Close
            </button>
          ) : null}
        </div>
      ) : (
        <header>
          <h1 className="text-base font-bold text-slate-900">{profile.name || 'Your profile'}</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Everything PathMitra uses to personalise advice. Change anything, any time.
          </p>
        </header>
      )}

      {hideAdvanced ? <Card className="space-y-3">
        <SectionTitle>Personal details</SectionTitle>
        <label className="block">
          <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Name</span>
          <input
            value={hideAdvanced ? draft.name : profile.name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="Your name"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-800 outline-none focus:border-indigo-400"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Age</span>
            <input
              value={hideAdvanced ? draft.age ?? '' : profile.age ?? ''}
              onChange={(e) => patch({ age: e.target.value })}
              placeholder="18"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-800 outline-none focus:border-indigo-400"
            />
          </label>
          <label className="block">
            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Gender</span>
            <input
              value={hideAdvanced ? draft.gender ?? '' : profile.gender ?? ''}
              onChange={(e) => patch({ gender: e.target.value })}
              placeholder="Female"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-800 outline-none focus:border-indigo-400"
            />
          </label>
        </div>
      </Card> : null}

      {hideAdvanced ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-[11px] font-semibold text-slate-600"
          >
            Save and close
          </button>
        </div>
      ) : (
        <>
          <SectionTitle>Current stage</SectionTitle>
          <Card>
            <div className="flex flex-wrap gap-1.5">
              {QUALIFICATIONS.map((q) => (
                <Chip
                  key={q.id}
                  active={profile.qualification === q.id}
                  onClick={() => patch({ qualification: profile.qualification === q.id ? '' : q.id })}
                >
                  {q.emoji} {q.label}
                </Chip>
              ))}
            </div>
            {!profile.qualification ? (
              <p className="text-[10px] text-amber-700 mt-2 leading-relaxed">
                No stage chosen yet — recommendations will stay generic until you pick one.
              </p>
            ) : null}
          </Card>

          <SectionTitle hint={`${profile.interests.length} selected`}>Your interests</SectionTitle>
          <Card>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(INTERESTS) as Array<keyof typeof INTERESTS>).map((id) => (
                <Chip
                  key={id}
                  active={profile.interests.includes(id)}
                  onClick={() =>
                    patch({
                      interests: profile.interests.includes(id)
                        ? profile.interests.filter((x) => x !== id)
                        : [...profile.interests, id],
                    })
                  }
                >
                  {INTERESTS[id].emoji} {INTERESTS[id].label}
                </Chip>
              ))}
            </div>
          </Card>

          <SectionTitle>Family constraints</SectionTitle>
          <Card className="space-y-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">Fee budget per year</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(BUDGET_LABELS) as BudgetBand[]).map((id) => (
                  <Chip key={id} active={profile.budget === id} onClick={() => patch({ budget: id })}>
                    {BUDGET_LABELS[id]}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">How far you can travel</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(MOBILITY_LABELS) as Mobility[]).map((id) => (
                  <Chip key={id} active={profile.mobility === id} onClick={() => patch({ mobility: id })}>
                    {MOBILITY_LABELS[id]}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">Risk appetite</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(RISK_LABELS) as RiskAppetite[]).map((id) => (
                  <Chip key={id} active={profile.risk === id} onClick={() => patch({ risk: id })}>
                    {RISK_LABELS[id]}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">
                What matters most (any of these)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRIORITY_IDS.map((id) => (
                  <Chip
                    key={id}
                    active={profile.priorities.includes(id)}
                    onClick={() =>
                      patch({
                        priorities: profile.priorities.includes(id)
                          ? profile.priorities.filter((x) => x !== id)
                          : [...profile.priorities, id],
                      })
                    }
                  >
                    {PRIORITY_LABELS[id]}
                  </Chip>
                ))}
              </div>
            </div>
          </Card>

          <SectionTitle hint="saved on this device">Your shortlist</SectionTitle>
          {profile.savedPathways.length === 0 ? (
            <Card>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Routes you heart in the Explore tab appear here as your shortlist for the family discussion.
              </p>
            </Card>
          ) : (
            <Card className="space-y-1.5">
              {profile.savedPathways.map((id) => {
                const p = PATHWAYS.find((x) => x.id === id);
                if (!p) return null;
                return (
                  <div key={id} className="flex items-center justify-between gap-2 py-1">
                    <span className="text-[11px] text-slate-800">
                      {p.emoji} {p.shortName}
                    </span>
                    <button
                      onClick={() => patch({ savedPathways: profile.savedPathways.filter((x) => x !== id) })}
                      aria-label={`Remove ${p.shortName} from shortlist`}
                      className="text-rose-400 hover:text-rose-600"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                );
              })}
            </Card>
          )}

          <SectionTitle>Roadmap progress</SectionTitle>
          <Card className="flex items-center justify-between">
            <span className="text-[11px] text-slate-700">Steps completed</span>
            <Tag tone={profile.completedMilestones.length > 0 ? 'emerald' : 'slate'}>
              {profile.completedMilestones.length}
            </Tag>
          </Card>

          <SectionTitle hint="private by design">Data and privacy</SectionTitle>
          <Card className="space-y-2">
            <p className="text-[10px] text-slate-600 leading-relaxed">
              Your answers are stored only in this browser local storage. The name field is optional and exists only so the
              app can greet you. The advisor request includes your stage, interests and constraints so the answer fits you
              — nothing else is collected, and there is no account.
            </p>
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Start over with a fresh profile
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] text-rose-700 font-semibold">
                  This erases your saved profile, shortlist and roadmap ticks from this browser.
                </p>
                <button onClick={handleClear} className="w-full py-2.5 rounded-xl bg-rose-600 text-white text-[11px] font-bold">
                  Yes, erase everything
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-600"
                >
                  Keep my profile
                </button>
              </div>
            )}
          </Card>

          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            PathMitra AI · Your AI Guide from Education to Career
          </p>
        </>
      )}

      {hideAdvanced ? (
        <div className="relative mx-auto aspect-[1368/1145] w-full max-w-[24rem] overflow-hidden rounded-[2rem] bg-[#f4f0ff]">
          <span aria-hidden="true" className="absolute -left-14 top-16 z-0 h-44 w-44 rounded-full bg-[#b8ddff]" />
          <span aria-hidden="true" className="absolute -right-14 top-4 z-0 h-40 w-40 rounded-full bg-[#b9efd4]" />
          <span aria-hidden="true" className="absolute left-8 top-[-2rem] z-0 h-32 w-48 rotate-[-18deg] rounded-[44%] bg-[#c7b8ff]" />
          <span aria-hidden="true" className="absolute bottom-[-2rem] left-8 z-0 h-28 w-48 rotate-6 rounded-full border-[12px] border-[#ffc96f]" />
          <span aria-hidden="true" className="absolute bottom-12 right-10 z-0 h-7 w-7 rounded-full bg-[#ff8faf]" />
          <span aria-hidden="true" className="absolute right-8 top-24 z-0 h-16 w-16 rounded-full border-4 border-white/80" />
          <Image
            src="/profile%20edit.png"
            alt="Student exploring education and career paths"
            width={1368}
            height={1145}
            className="relative z-10 h-full w-full object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}