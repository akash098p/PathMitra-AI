'use client';

import React from 'react';
import { opportunitiesForStage, skillTracksForStage } from '@/lib/stagematch';
import { INTERESTS } from '@/data/qualifications';
import type { StudentProfile } from '@/lib/types';
import { Bullet, Card, EmptyState, LinkList, SectionTitle, Tag } from '@/components/ui';

// ============================================================================
// Skills & opportunities — what a student can start this week without waiting
// for an entrance result, plus the apprenticeships and competitions they can
// actually enter from their stage.
// ============================================================================

const TYPE_LABEL: Record<string, string> = {
  apprenticeship: 'apprenticeship',
  internship: 'internship',
  'placement-drive': 'placement drive',
  'job-portal': 'hiring test',
  competition: 'competition',
  olympiad: 'olympiad',
  'scholarship-test': 'scholarship test',
  community: 'programme',
};

export function SkillsScreen({
  profile,
}: {
  profile: StudentProfile;
}) {
  const tracks = skillTracksForStage(profile.interests, profile.qualification);
  const visible = tracks;
  const opportunities = opportunitiesForStage(profile.qualification);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Skills you can start this week</h2>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          No entrance result is needed for any of this. A finished project with a public link is worth more than a
          certificate in almost every hiring conversation.
        </p>
      </div>

      {profile.interests.length > 0 ? (
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Ranked by your interests: {profile.interests.slice(0, 3).map((i) => INTERESTS[i]?.label ?? i).join(', ')} — then
          by what pays off at your stage.
        </p>
      ) : (
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Ranked for your stage. Add interests in Profile to reorder these around what you enjoy.
        </p>
      )}

      {visible.length === 0 ? (
        <EmptyState title="Pick a track" body="Add interests in your profile to order these tracks for you." />
      ) : null}

      <div className="space-y-2.5">
        {visible.map((track) => (
          <Card key={track.id} className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-900">
                {track.emoji} {track.name}
              </h3>
              <Tag tone="indigo">{track.timeToFirstProject}</Tag>
            </div>
            <p className="text-[10px] text-slate-500">
              {track.weeklyHours} • outcome roles: {track.outcomeRoles.slice(0, 2).join(', ')}
            </p>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1">Milestones, in order</p>
              {track.milestones.slice(0, 4).map((m, i) => (
                <div key={m} className="flex gap-2 items-start">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 text-[8px] font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-[10px] text-slate-700 leading-relaxed">{m}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1">First projects to try</p>
              {track.beginnerProjects.slice(0, 3).map((p) => (
                <Bullet key={p} tone="emerald">
                  {p}
                </Bullet>
              ))}
            </div>

            <div className="pt-1 border-t border-slate-50">
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">Free resources</p>
              <LinkList links={track.resources} />
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle hint={`matched to your stage`}>Apprenticeships, contests &amp; programmes</SectionTitle>
      <div className="space-y-2.5">
        {opportunities.map((o) => (
          <Card key={o.id} className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[11px] font-bold text-slate-900 leading-snug">{o.name}</h3>
              <Tag tone="slate">{TYPE_LABEL[o.type] ?? o.type}</Tag>
            </div>
            <p className="text-[10px] text-slate-500">{o.provider}</p>
            <p className="text-[10px] text-slate-700 leading-relaxed">{o.eligibility}</p>
            <p className="text-[10px] font-semibold text-slate-700">{o.stipend}</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">💡 {o.notes}</p>
            <LinkList links={[o.portal]} />
          </Card>
        ))}
      </div>
    </div>
  );
}