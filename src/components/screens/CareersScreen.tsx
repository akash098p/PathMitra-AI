'use client';

import React, { useState } from 'react';
import { CAREERS } from '@/data/careers';
import { QUALIFICATIONS } from '@/data/qualifications';
import { careersForStage, isCareerCloseMatch } from '@/lib/stagematch';
import type { StudentProfile } from '@/lib/types';
import { Bullet, Card, Chip, KeyValue, Meter, SectionTitle, Tag } from '@/components/ui';

// ============================================================================
// Careers — government and private roles with realistic pay bands, the growth
// ladder, and an honest note for parents about stability.
// ============================================================================

const DEMAND_TONE: Record<string, 'emerald' | 'indigo' | 'amber' | 'rose'> = {
  'very high': 'emerald',
  high: 'indigo',
  steady: 'amber',
  competitive: 'rose',
};

export function CareersScreen({
  profile,
  onBack,
}: {
  profile: StudentProfile;
  onBack?: () => void;
}) {
  const [sector, setSector] = useState<'all' | 'govt' | 'private'>('all');

  // Stage-aware ordering: roles open from this qualification come first, then
  // the rest of the market by demand — never an empty screen for any stage.
  const ordered = careersForStage(profile.qualification);
  const qualificationLabel =
    QUALIFICATIONS.find((q) => q.id === profile.qualification)?.label ?? 'your stage';
  const closeCount = profile.qualification
    ? ordered.filter((c) => isCareerCloseMatch(c, profile.qualification)).length
    : ordered.length;

  const visible = ordered.filter((c) => {
    if (sector === 'all') return true;
    if (sector === 'govt') return c.sector === 'govt' || c.sector === 'both';
    return c.sector === 'private' || c.sector === 'both';
  });

  const govtCount = CAREERS.filter((c) => c.sector === 'govt' || c.sector === 'both').length;
  const privateCount = CAREERS.filter((c) => c.sector === 'private' || c.sector === 'both').length;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Where the actual jobs are</h2>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          {CAREERS.length} roles across government and private India — with starting pay, experienced pay and an
          honest stability note. {govtCount} government-linked, {privateCount} private-linked.
          {profile.qualification
            ? ` The ${closeCount} marked "open to your stage" are your closest matches and appear first.`
            : ''}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Chip active={sector === 'all'} onClick={() => setSector('all')}>
          All roles
        </Chip>
        <Chip active={sector === 'govt'} onClick={() => setSector('govt')}>
          Government first
        </Chip>
        <Chip active={sector === 'private'} onClick={() => setSector('private')}>
          Private first
        </Chip>
      </div>

      <SectionTitle hint="tap nothing — just read">Role by role</SectionTitle>
      <div className="space-y-2.5">
        {visible.map((career) => (
          <Card key={career.id} className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-2.5 items-start min-w-0">
                <span className="text-lg leading-none mt-0.5">{career.emoji}</span>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">{career.title}</h3>
                  <p className="text-[10px] text-slate-500">{career.minimumQualification}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Tag tone={career.sector === 'govt' ? 'emerald' : career.sector === 'private' ? 'indigo' : 'slate'}>
                  {career.sector}
                </Tag>
                {isCareerCloseMatch(career, profile.qualification) ? (
                  <Tag tone="sky">open to your stage</Tag>
                ) : null}
              </div>
            </div>

            <KeyValue label="Starting" value={career.startingBand} />
            <KeyValue label="Experienced" value={career.experiencedBand} />

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">Growth ladder</p>
              <div className="flex items-center gap-1 flex-wrap">
                {career.growthPath.map((step, i) => (
                  <React.Fragment key={step}>
                    {i > 0 ? <span className="text-slate-300 text-[10px]">→</span> : null}
                    <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-[9px] text-slate-600">
                      {step}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Demand outlook</p>
                <Tag tone={DEMAND_TONE[career.demandOutlook] ?? 'slate'}>{career.demandOutlook}</Tag>
              </div>
              <Meter
                value={
                  career.demandOutlook === 'very high' ? 100 : career.demandOutlook === 'high' ? 78 : career.demandOutlook === 'steady' ? 58 : 42
                }
                tone={DEMAND_TONE[career.demandOutlook] ?? 'slate' as 'indigo'}
              />
            </div>

            <div className="pt-1.5 border-t border-slate-50">
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1">Who hires</p>
              {career.hiringBodies.slice(0, 3).map((h) => (
                <Bullet key={h} tone="slate">
                  {h}
                </Bullet>
              ))}
            </div>

            <p className="text-[10px] bg-amber-50 text-amber-900 rounded-xl p-2.5 leading-relaxed">
              👨‍👩‍👧 {career.parentNote}
            </p>
          </Card>
        ))}
      </div>

      {profile.qualification ? (
        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
          Ordered for {qualificationLabel}. The hiring tests, drives and government exams for this stage are on the
          Placements &amp; internships screen.
        </p>
      ) : null}
    </div>
  );
}