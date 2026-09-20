'use client';

import React from 'react';
import { findExam } from '@/data/exams';
import { findStageGuide } from '@/data/nextsteps';
import { QUALIFICATIONS } from '@/data/qualifications';
import type { NextStepCategory, StudentProfile } from '@/lib/types';
import { Bullet, Card, EmptyState, LinkList, SectionTitle, Tag, VerificationNote } from '@/components/ui';

// ============================================================================
// Next Step — the "what is the next best career opportunity for ME" screen.
// Every stage gets its own ranked playbook: jobs, placements, internships,
// exams, higher study and skills, with honest pitfalls.
// ============================================================================

const CATEGORY_LABEL: Record<NextStepCategory, string> = {
  job: 'job route',
  placement: 'placement',
  internship: 'internship',
  exam: 'exam',
  'higher-study': 'higher study',
  skill: 'skill',
};

const CATEGORY_TONE: Record<NextStepCategory, 'emerald' | 'indigo' | 'sky' | 'amber' | 'violet' | 'rose'> = {
  job: 'emerald',
  placement: 'indigo',
  internship: 'sky',
  exam: 'amber',
  'higher-study': 'violet',
  skill: 'rose',
};

export function NextStepScreen({
  profile,
  onOpenExam,
  onBack,
}: {
  profile: StudentProfile;
  onOpenExam?: (examId: string) => void;
  onBack?: () => void;
}) {
  const guide = findStageGuide(profile.qualification);
  const qualification = QUALIFICATIONS.find((q) => q.id === profile.qualification);

  if (!guide) {
    return (
      <div className="p-4 space-y-4">
        <EmptyState
          title="Set your stage first"
          body="Choose your current qualification in Profile, and this screen will rank the next best moves for exactly that stage."
        />
        {onBack ? (
          <Card onClick={onBack} className="text-center">
            <p className="text-[10px] font-semibold text-indigo-600">Back</p>
          </Card>
        ) : null}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          <Tag tone="indigo">{qualification?.label ?? 'Your stage'}</Tag>
        </div>
        <h2 className="text-sm font-bold text-slate-900 leading-snug">🚀 {guide.headline}</h2>
        <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{guide.summary}</p>
      </div>

      <Card className="bg-indigo-50/60 border-indigo-100">
        <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-500 mb-1.5">What matters here</p>
        <div className="flex flex-wrap gap-1.5">
          {guide.focus.map((f) => (
            <span key={f} className="px-2 py-0.5 bg-white border border-indigo-100 rounded-full text-[9px] text-indigo-800">
              {f}
            </span>
          ))}
        </div>
      </Card>

      <SectionTitle hint="ranked for your stage">Your next best moves</SectionTitle>
      <div className="space-y-2.5">
        {guide.nextBest.map((card, index) => (
          <Card key={card.id} className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-2 items-start min-w-0">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <h3 className="text-xs font-bold text-slate-900 leading-snug">{card.title}</h3>
              </div>
              <Tag tone={CATEGORY_TONE[card.category]}>{CATEGORY_LABEL[card.category]}</Tag>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">{card.why}</p>
            <p className="text-[10px] font-semibold text-slate-700">⏱ {card.timeline}</p>
            <div className="space-y-1.5 pt-0.5">
              {card.actions.map((action, i) => (
                <div key={action} className="flex gap-2 items-start">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[8px] font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-[10px] text-slate-700 leading-relaxed">{action}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {card.tags.map((t) => (
                <span key={t} className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-[9px] text-slate-500">
                  {t}
                </span>
              ))}
            </div>
            <div className="pt-1 border-t border-slate-50">
              <LinkList links={card.links} />
            </div>
          </Card>
        ))}
      </div>

      {guide.govtExams.length > 0 ? (
        <>
          <SectionTitle hint="tap to open">Exams worth your calendar</SectionTitle>
          <Card className="space-y-2">
            {guide.govtExams.map((id) => {
              const exam = findExam(id);
              if (!exam) return null;
              return onOpenExam ? (
                <div
                  key={id}
                  onClick={() => onOpenExam(id)}
                  className="cursor-pointer rounded-xl border border-slate-100 px-2.5 py-2 flex items-center justify-between hover:border-indigo-300 transition"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-900">{exam.shortName}</p>
                    <p className="text-[9px] text-slate-500 truncate">{exam.cycleWindow}</p>
                  </div>
                  <span className="text-indigo-400 text-xs">›</span>
                </div>
              ) : (
                <Bullet key={id} tone="indigo">
                  <span className="font-bold">{exam.shortName}</span> — {exam.cycleWindow}
                </Bullet>
              );
            })}
          </Card>
        </>
      ) : null}

      <SectionTitle hint="learned the hard way">What goes wrong at this stage</SectionTitle>
      <Card className="space-y-2">
        {guide.pitfalls.map((p) => (
          <Bullet key={p} tone="amber">
            {p}
          </Bullet>
        ))}
      </Card>

      <VerificationNote />
    </div>
  );
}