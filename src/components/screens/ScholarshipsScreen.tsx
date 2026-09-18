'use client';

import React, { useState } from 'react';
import { SCHOLARSHIPS, scholarshipsForQualification } from '@/data/scholarships';
import { QUALIFICATIONS } from '@/data/qualifications';
import type { StudentProfile } from '@/lib/types';
import { Bullet, Card, Chip, KeyValue, LinkList, SectionTitle, Tag } from '@/components/ui';

// ============================================================================
// Scholarships & fees — central, state and institute schemes matched to the
// student's stage, with document checklists so applications do not stall.
// ============================================================================

export function ScholarshipsScreen({ profile }: { profile: StudentProfile }) {
  const [scope, setScope] = useState<'all' | 'central' | 'state' | 'institute'>('all');

  const matched = profile.qualification ? scholarshipsForQualification(profile.qualification) : SCHOLARSHIPS;
  const visible = SCHOLARSHIPS.filter((s) => {
    if (scope === 'all') return true;
    return s.level === scope;
  });
  const ordered = [...visible].sort((a, b) => {
    const aMatched = matched.some((m) => m.id === a.id) ? 0 : 1;
    const bMatched = matched.some((m) => m.id === b.id) ? 0 : 1;
    return aMatched - bMatched;
  });

  const qualificationMeta = QUALIFICATIONS.find((q) => q.id === profile.qualification);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Scholarships, freeships &amp; loans</h2>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          Most central schemes run through the National Scholarship Portal with Direct Benefit Transfer. Income limits
          and deadlines change every year — the portal is the authority.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Chip active={scope === 'all'} onClick={() => setScope('all')}>
          All schemes
        </Chip>
        <Chip active={scope === 'central'} onClick={() => setScope('central')}>
          Central
        </Chip>
        <Chip active={scope === 'state'} onClick={() => setScope('state')}>
          State
        </Chip>
        <Chip active={scope === 'institute'} onClick={() => setScope('institute')}>
          Institute
        </Chip>
      </div>

      {profile.qualification ? (
        <Card className="bg-emerald-50/70 border-emerald-100">
          <p className="text-[10px] text-emerald-900 leading-relaxed">
            Sorted for {qualificationMeta?.label}. Schemes open to your stage appear first.
          </p>
        </Card>
      ) : null}

      <div className="space-y-2.5">
        {ordered.map((s) => {
          const isMatched = matched.some((m) => m.id === s.id);
          return (
            <Card key={s.id} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs font-bold text-slate-900 leading-snug">{s.name}</h3>
                <Tag tone={s.level === 'central' ? 'indigo' : s.level === 'state' ? 'amber' : 'slate'}>{s.level}</Tag>
              </div>
              <p className="text-[10px] text-slate-500">{s.provider}</p>
              <KeyValue label="Who can apply" value={s.eligibility} />
              <KeyValue label="Income limit" value={s.incomeCeiling} />
              <KeyValue label="Benefit" value={s.benefits} />
              <KeyValue label="Window" value={s.window} />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1">Documents to keep ready</p>
                <div className="flex flex-wrap gap-1">
                  {s.documents.map((d) => (
                    <span key={d} className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-[9px] text-slate-600">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                <span className="text-[9px] font-bold text-emerald-700">
                  {isMatched ? '✓ open to your stage' : 'check eligibility'}
                </span>
              </div>
              <LinkList links={[s.portal]} />
            </Card>
          );
        })}
      </div>

      <SectionTitle>Before you apply anywhere</SectionTitle>
      <Card className="space-y-2">
        <Bullet tone="amber">Never pay an agent for a government scholarship — every scheme here is free to apply for.</Bullet>
        <Bullet tone="amber">Keep scanned copies of all documents under 200 KB before starting the form.</Bullet>
        <Bullet tone="amber">Renewal is usually easier than a fresh application — do not let a previous year lapse.</Bullet>
        <Bullet tone="amber">The bank account must be in the student name and Aadhaar-linked for DBT to succeed.</Bullet>
      </Card>
    </div>
  );
}