'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { OPPORTUNITIES, opportunitiesFor } from '@/data/opportunities';
import { findExam } from '@/data/exams';
import { findStageGuide, placementChecklistFor } from '@/data/nextsteps';
import { QUALIFICATIONS } from '@/data/qualifications';
import type { Opportunity, StudentProfile } from '@/lib/types';
import { Card, EmptyState, LinkList, SectionTitle, Tag, VerificationNote } from '@/components/ui';

// ============================================================================
// Placements & internships — one screen for every stage that asks "how do I
// actually get placed or get an internship?": readiness checklist, hiring
// tests and drives, internships/apprenticeships matched to the stage, and the
// government exam routes that hire in volume.
// ============================================================================

const TYPE_LABEL: Record<string, string> = {
  apprenticeship: 'apprenticeship',
  internship: 'internship',
  'placement-drive': 'placement drive',
  'job-portal': 'hiring test / portal',
};

function openToStage(o: Opportunity, qualification: string): boolean {
  return o.openTo.includes(qualification as Opportunity['openTo'][number]);
}

export function PlacementsScreen({
  profile,
  onToggleSaved,
  onBack,
}: {
  profile: StudentProfile;
  onToggleSaved?: (opportunityId: string) => void;
  onBack?: () => void;
}) {
  const guide = findStageGuide(profile.qualification);
  const qualification = QUALIFICATIONS.find((q) => q.id === profile.qualification);
  const checklist = placementChecklistFor(profile.qualification);

  const stagePool = profile.qualification ? opportunitiesFor(profile.qualification) : OPPORTUNITIES;
  const hiringTests = stagePool.filter((o) => o.type === 'placement-drive' || o.type === 'job-portal');
  const internships = stagePool.filter((o) => o.type === 'internship' || o.type === 'apprenticeship');
  const stageExams = (guide?.govtExams ?? [])
    .map((id) => findExam(id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  if (!qualification) {
    return (
      <div className="p-4 space-y-4">
        <EmptyState
          title="Set your stage first"
          body="Choose your qualification in Profile and this screen matches internships, hiring tests and the placement checklist to your exact stage."
        />
        {onBack ? (
          <Card onClick={onBack} className="text-center">
            <p className="text-[10px] font-semibold text-indigo-600">Back</p>
          </Card>
        ) : null}
      </div>
    );
  }

  const OpportunityCard = ({ o }: { o: Opportunity }) => {
    const saved = profile.savedOpportunities.includes(o.id);
    return (
      <Card className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[11px] font-bold text-slate-900 leading-snug">{o.name}</h3>
          <Tag tone={o.type === 'placement-drive' ? 'indigo' : o.type === 'job-portal' ? 'violet' : 'emerald'}>
            {TYPE_LABEL[o.type] ?? o.type}
          </Tag>
        </div>
        <p className="text-[10px] text-slate-500">{o.provider}</p>
        <p className="text-[10px] text-slate-700 leading-relaxed">{o.eligibility}</p>
        <p className="text-[10px] font-semibold text-slate-700">💰 {o.stipend}</p>
        <p className="text-[10px] text-slate-500 leading-relaxed">💡 {o.notes}</p>
        <div className="flex items-center justify-between pt-1 border-t border-slate-50">
          <LinkList links={[o.portal]} />
          {onToggleSaved ? (
            <button
              onClick={() => onToggleSaved(o.id)}
              aria-label={saved ? `Remove ${o.name} from saved` : `Save ${o.name}`}
              className={`p-1.5 rounded-lg ${saved ? 'text-rose-500 bg-rose-50' : 'text-slate-300 hover:text-rose-400'}`}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            </button>
          ) : null}
        </div>
      </Card>
    );
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          <Tag tone="emerald">{qualification.label}</Tag>
        </div>
        <h2 className="text-sm font-bold text-slate-900 leading-snug">💼 Placements &amp; internships for your stage</h2>
        <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
          {guide
            ? guide.headline
            : 'The readiness checklist, hiring tests, internships and government routes that fit this qualification — with official portals.'}
        </p>
      </div>

      <SectionTitle hint="do these in order">Placement readiness checklist</SectionTitle>
      <Card className="space-y-2">
        {checklist.map((item, index) => (
          <div key={item} className="flex gap-2 items-start">
            <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 text-[8px] font-bold flex items-center justify-center flex-shrink-0">
              {index + 1}
            </span>
            <p className="text-[10px] text-slate-700 leading-relaxed">{item}</p>
          </div>
        ))}
      </Card>

      <SectionTitle hint="register early — windows close">Hiring tests &amp; placement drives</SectionTitle>
      {hiringTests.length > 0 ? (
        <div className="space-y-2.5">
          {hiringTests.map((o) => (
            <OpportunityCard key={o.id} o={o} />
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Standardised hiring tests apply from the final year onward. Until then, the checklist above and one skill track are your best placement preparation.
          </p>
        </Card>
      )}

      <SectionTitle hint="matched to your stage">Internships &amp; apprenticeships</SectionTitle>
      <div className="space-y-2.5">
        {internships.map((o) => (
          <OpportunityCard key={o.id} o={o} />
        ))}
      </div>

      {stageExams.length > 0 ? (
        <>
          <SectionTitle hint="government routes hiring at your stage">Exams that hire in volume</SectionTitle>
          <Card className="space-y-2">
            {stageExams.map((exam) => (
              <div key={exam.id} className="flex items-start justify-between gap-2 pb-1.5 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-900">{exam.shortName}</p>
                  <p className="text-[9px] text-slate-500 leading-relaxed">{exam.grants}</p>
                </div>
                <Tag tone="slate">{exam.level}</Tag>
              </div>
            ))}
          </Card>
        </>
      ) : null}

      {profile.savedOpportunities.length > 0 ? (
        <>
          <SectionTitle hint="saved on this device">Your saved opportunities</SectionTitle>
          <Card className="space-y-2">
            {profile.savedOpportunities.map((id) => {
              const o = OPPORTUNITIES.find((x) => x.id === id);
              if (!o) return null;
              return (
                <p key={id} className="text-[10px] text-slate-700 leading-relaxed">
                  ❤️ {o.name}
                </p>
              );
            })}
          </Card>
        </>
      ) : null}

      <VerificationNote>
        Internship windows, stipend rules and drive criteria change every cycle. Always confirm the current notification on the official portal linked on this screen before paying anything.
      </VerificationNote>
    </div>
  );
}