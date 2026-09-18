'use client';

import React, { useState } from 'react';
import { STATES } from '@/data/states';
import { findState } from '@/data/states';
import { examsByIds } from '@/data/exams';
import type { StudentProfile } from '@/lib/types';
import { Bullet, Card, Chip, EmptyState, LinkList, SectionTitle, Tag, VerificationNote } from '@/components/ui';

// ============================================================================
// My state — boards, technical councils, local exams and official portals for
// the student's own state. Education is a state subject, so this changes the
// practical advice more than anything else.
// ============================================================================

export function StateScreen({
  profile,
  onBack,
}: {
  profile: StudentProfile;
  onBack?: () => void;
}) {
  const [selectedCode, setSelectedCode] = useState<string>(() => profile.name && STATES[0] ? STATES[0].code : STATES[0]?.code ?? '');
  const state = findState(selectedCode) ?? STATES[0];

  if (!state) return <EmptyState title="State data unavailable" body="Please pick a state." />;

  const localExams = examsByIds(state.keyExams);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Your state changes the rules</h2>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          Boards, polytechnic councils, entrance tests and fee reimbursement are all decided state by state. Pick your
          state to see the local picture.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STATES.map((s) => (
          <Chip key={s.code} active={selectedCode === s.code} onClick={() => setSelectedCode(s.code)}>
            {s.name}
          </Chip>
        ))}
      </div>

      <Card className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900">
            {state.name}
          </h3>
          <Tag tone="indigo">{state.code}</Tag>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1">School boards</p>
          {state.schoolBoards.map((b) => (
            <Bullet key={b} tone="indigo">
              {b}
            </Bullet>
          ))}
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1">Technical board</p>
          <p className="text-[11px] text-slate-700 leading-relaxed">{state.technicalBoard}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1">Study and exam languages</p>
          <p className="text-[11px] text-slate-700">{state.languages.join(' • ')}</p>
        </div>
      </Card>

      <SectionTitle hint="from the exam database">Local entrance routes</SectionTitle>
      {localExams.length === 0 ? (
        <Card>
          <p className="text-[11px] text-slate-500">
            This state mostly admits on merit through the common portal below rather than a separate entrance test.
          </p>
        </Card>
      ) : null}
      <div className="space-y-2">
        {localExams.map((exam) => (
          <Card key={exam.id} className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-[11px] font-bold text-slate-900">{exam.name}</h4>
              <Tag tone="amber">state</Tag>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">{exam.grants}</p>
            <p className="text-[10px] text-slate-500">Cycle: {exam.cycleWindow}</p>
          </Card>
        ))}
      </div>

      <SectionTitle hint="bookmark these">Official portals</SectionTitle>
      <Card>
        <LinkList links={state.portals} />
      </Card>

      <Card className="bg-indigo-50/70 border-indigo-100">
        <p className="text-[10px] text-indigo-900 leading-relaxed">
          <strong>Why this matters:</strong> {state.notes}
        </p>
      </Card>

      <VerificationNote />
    </div>
  );
}