'use client';

import React, { useState } from 'react';
import { PATHWAYS } from '@/data/pathways';
import { QUALIFICATIONS } from '@/data/qualifications';
import type { PathwayId, StudentProfile } from '@/lib/types';
import { Card, Chip, EmptyState, SectionTitle, Tag } from '@/components/ui';

// ============================================================================
// Compare — pick two or three routes and see every dimension side by side,
// including the money gap between the government and private versions.
// ============================================================================

const ROWS: { label: string; render: (p: typeof PATHWAYS[number]) => string }[] = [
  { label: 'Duration', render: (p) => p.durationLabel },
  { label: 'Who can join', render: (p) => p.startsAfter.map((q) => QUALIFICATIONS.find((x) => x.id === q)?.label ?? q).join('; ') },
  { label: 'Government fee', render: (p) => p.cost.government },
  { label: 'Private fee', render: (p) => p.cost.private },
  { label: 'Entrance exams', render: (p) => p.entranceExams.slice(0, 4).join(', ') || 'No entrance test' },
  { label: 'Top government job', render: (p) => p.govtJobs[0] ?? '—' },
  { label: 'Top private job', render: (p) => p.privateJobs[0] ?? '—' },
  { label: 'Risk level', render: (p) => `${p.risk} route` },
  { label: 'Biggest strength', render: (p) => p.pros[0] ?? '—' },
  { label: 'Biggest risk', render: (p) => p.cons[0] ?? '—' },
];

export function CompareScreen({
  profile,
  onOpenPathway,
}: {
  profile: StudentProfile;
  onOpenPathway: (pathwayId: string) => void;
}) {
  const [selected, setSelected] = useState<PathwayId[]>(() => {
    const eligible = PATHWAYS.filter((p) => p.startsAfter.includes(profile.qualification as typeof p.startsAfter[number]));
    const defaults = eligible.length >= 2 ? eligible : PATHWAYS;
    return defaults.slice(0, 2).map((p) => p.id);
  });

  function toggle(id: PathwayId) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  const chosen = selected.map((id) => PATHWAYS.find((p) => p.id === id)).filter((p): p is (typeof PATHWAYS)[number] => Boolean(p));

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Compare routes honestly</h2>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          Pick up to three routes. The same route can differ by lakhs of rupees depending on government or private seats.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PATHWAYS.map((p) => (
          <Chip key={p.id} active={selected.includes(p.id)} onClick={() => toggle(p.id)}>
            {p.emoji} {p.shortName}
          </Chip>
        ))}
      </div>

      {chosen.length === 0 ? <EmptyState title="Nothing selected" body="Choose at least one route above." /> : null}

      {chosen.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-50/80">
                  <th className="p-3 text-[9px] font-bold uppercase tracking-wide text-slate-500 w-20">Route</th>
                  {chosen.map((p) => (
                    <th key={p.id} className="p-3 text-[11px] font-bold text-indigo-900 min-w-[130px]">
                      <button onClick={() => onOpenPathway(p.id)} className="text-left hover:underline">
                        {p.emoji} {p.shortName}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="border-t border-slate-100">
                    <th scope="row" className="p-3 align-top text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      {row.label}
                    </th>
                    {chosen.map((p) => (
                      <td key={p.id} className="p-3 align-top text-[10px] text-slate-700 leading-relaxed">
                        {row.render(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      <SectionTitle hint="why this matters">Reading the table like a parent</SectionTitle>
      <Card className="space-y-2">
        {chosen.map((p) => (
          <div key={p.id} className="flex items-start gap-2">
            <span className="text-sm leading-none mt-0.5">{p.emoji}</span>
            <div>
              <h4 className="text-[11px] font-bold text-slate-900">{p.shortName}</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                <Tag tone="emerald">govt: {p.cost.government.split(' (')[0]}</Tag>
                <Tag tone="rose">private: {p.cost.private.split(' (')[0]}</Tag>
              </div>
            </div>
          </div>
        ))}
        <p className="text-[10px] text-slate-500 leading-relaxed pt-2 border-t border-slate-50">
          The cheapest reliable estimate is always the government-seat figure plus exam fees and travel. Use the
          What-if simulator to see how the full timeline compares before the first salary.
        </p>
      </Card>
    </div>
  );
}