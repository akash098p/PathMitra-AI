'use client';

import React, { useState } from 'react';
import { SCENARIOS, paybackNote, formatINR } from '@/lib/roi';
import { Bullet, Card, Chip, KeyValue, SectionTitle, Tag } from '@/components/ui';

// ============================================================================
// What-if simulator — the same life, told two or three different ways. This is
// the screen that finally answers the question parents actually ask: how much,
// by when, and what happens if it does not work out.
// ============================================================================

export function ScenarioScreen() {
  const [activeId, setActiveId] = useState(SCENARIOS[0].id);
  const scenario = SCENARIOS.find((s) => s.id === activeId) ?? SCENARIOS[0];

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900">What if I took the other road?</h2>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          The same student, the same Class 10 result — but a different route. Costs are indicative ranges across
          government and private seats, so treat them as honest brackets rather than exact quotes.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SCENARIOS.map((s) => (
          <Chip key={s.id} active={activeId === s.id} onClick={() => setActiveId(s.id)}>
            {s.emoji} {s.title.split('→')[0].trim()}
          </Chip>
        ))}
      </div>

      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xs font-bold text-slate-900 leading-snug">{scenario.title}</h3>
          <Tag tone="indigo">{scenario.totalYears} yrs</Tag>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">{scenario.summary}</p>
        <KeyValue label="Total cost range" value={`${formatINR(scenario.costLow)} – ${formatINR(scenario.costHigh)}`} />
        <KeyValue label="First salary around age" value={`${scenario.firstEarningAge} years`} />
      </Card>

      <SectionTitle hint="the whole journey">Step by step</SectionTitle>
      <div className="relative pl-5 space-y-3">
        <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-indigo-100 rounded-full" />
        {scenario.steps.map((step, i) => (
          <div key={step.label} className="relative">
            <div
              className={`absolute -left-[14px] top-1.5 w-3 h-3 rounded-full border-2 border-white ${
                step.years === 0 ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}
            />
            <Card className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-[11px] font-bold text-slate-900">
                  {i + 1}. {step.label}
                </h4>
                {step.years === 0 ? (
                  <Tag tone="emerald">earning begins</Tag>
                ) : (
                  <Tag tone="slate">{step.years} yr{step.years === 1 ? '' : 's'}</Tag>
                )}
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed">{step.detail}</p>
              <p className="text-[10px] font-semibold text-slate-700">{step.cost}</p>
            </Card>
          </div>
        ))}
      </div>

      <SectionTitle>For the family conversation</SectionTitle>
      <Card className="space-y-2.5">
        <div>
          <h4 className="text-[11px] font-bold text-emerald-700 mb-1.5">What goes right</h4>
          {scenario.upsides.map((u) => (
            <Bullet key={u} tone="emerald">
              {u}
            </Bullet>
          ))}
        </div>
        <div>
          <h4 className="text-[11px] font-bold text-rose-700 mb-1.5">What can go wrong</h4>
          {scenario.downsides.map((d) => (
            <Bullet key={d} tone="rose">
              {d}
            </Bullet>
          ))}
        </div>
      </Card>

      <Card className="bg-amber-50/70 border-amber-100">
        <p className="text-[10px] text-amber-900 leading-relaxed">
          <strong>Cost to salary:</strong> {paybackNote(scenario)}
        </p>
      </Card>

      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
        Compare this with the other scenarios above. A cheaper route with an earlier salary is not a smaller life —
        it is a different order of the same life.
      </p>
    </div>
  );
}