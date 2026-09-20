'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { PATHWAYS } from '@/data/pathways';
import { QUALIFICATIONS } from '@/data/qualifications';
import { scorePathways } from '@/lib/recommend';
import type { StudentProfile } from '@/lib/types';
import { Bullet, Card, EmptyState, ScoreBadge, SectionTitle, Tag } from '@/components/ui';

// ============================================================================
// Explore — every route that is open from the student's current stage, ranked
// by fit. Saved routes are persisted in the profile.
// ============================================================================

export function ExploreScreen({
  profile,
  onOpenPathway,
  onToggleSaved,
}: {
  profile: StudentProfile;
  onOpenPathway: (pathwayId: string) => void;
  onToggleSaved: (pathwayId: string) => void;
}) {
  const qualificationMeta = QUALIFICATIONS.find((q) => q.id === profile.qualification);
  const ranked = scorePathways(profile, PATHWAYS.length);
  const eligibleIds = new Set(qualificationMeta ? qualificationMeta.canChoose : PATHWAYS.map((p) => p.id));

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900">All the routes open to you</h2>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          {qualificationMeta
            ? `Filtered for: ${qualificationMeta.label}. Tap the heart to shortlist a route.`
            : 'Set your current stage in Profile to personalise this list.'}
        </p>
      </div>

      {ranked.length === 0 ? (
        <EmptyState title="No eligible routes yet" body="Choose your current qualification first." />
      ) : null}

      <div className="space-y-2.5">
        {ranked.map((rec) => {
          const isEligible = eligibleIds.has(rec.pathway.id);
          const saved = profile.savedPathways.includes(rec.pathway.id);
          return (
            <Card key={rec.pathway.id} onClick={() => onOpenPathway(rec.pathway.id)} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex gap-2.5 items-start min-w-0">
                  <span className="text-xl leading-none mt-0.5">{rec.pathway.emoji}</span>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">{rec.pathway.shortName}</h3>
                    <p className="text-[10px] text-slate-500">{rec.pathway.durationLabel}</p>
                  </div>
                </div>
                <ScoreBadge score={rec.score} />
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{rec.pathway.bestFor}</p>
              <div className="flex flex-wrap gap-1">
                <Tag tone={rec.pathway.risk === 'safe' ? 'emerald' : rec.pathway.risk === 'ambitious' ? 'rose' : 'amber'}>
                  {rec.pathway.risk} route
                </Tag>
                {isEligible ? <Tag tone="indigo">open from your stage</Tag> : <Tag>needs another stage</Tag>}
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                <p className="text-[10px] font-bold text-indigo-600">Full route details</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSaved(rec.pathway.id);
                  }}
                  aria-label="Save this route"
                  className={`p-1.5 rounded-lg ${saved ? 'text-rose-500 bg-rose-50' : 'text-slate-300 hover:text-rose-400'}`}
                >
                  <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {profile.savedPathways.length > 0 ? (
        <>
          <SectionTitle hint="saved on this device">Your shortlist</SectionTitle>
          <Card className="space-y-2">
            {profile.savedPathways.map((id) => {
              const p = PATHWAYS.find((x) => x.id === id);
              if (!p) return null;
              return (
                <Bullet key={id} tone="indigo">
                  {p.emoji} {p.name}
                </Bullet>
              );
            })}
          </Card>
        </>
      ) : null}
    </div>
  );
}