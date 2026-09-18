'use client';

import React from 'react';
import { CheckCircle2, Clock, GraduationCap, Landmark, TrendingUp, XCircle } from 'lucide-react';
import { findPathway } from '@/data/pathways';
import { examsByIds } from '@/data/exams';
import { careersForPathway } from '@/data/careers';
import { fitForPathway } from '@/lib/recommend';
import type { StudentProfile } from '@/lib/types';
import { Bullet, Card, KeyValue, LinkList, ScoreBadge, SectionTitle, Tag, VerificationNote } from '@/components/ui';

// ============================================================================
// Pathway detail — the full honest picture of one route, split into the
// sections a student and a parent both need: syllabus, money, exams, jobs.
// ============================================================================

export function PathwayDetailScreen({
  pathwayId,
  profile,
  onOpenExam,
  onBack,
}: {
  pathwayId: string;
  profile: StudentProfile;
  onOpenExam: (examId: string) => void;
  onBack: () => void;
}) {
  const pathway = findPathway(pathwayId);
  if (!pathway) {
    return (
      <div className="p-4">
        <Card>
          <p className="text-[11px] text-slate-500">This route is not in the database yet.</p>
        </Card>
      </div>
    );
  }

  const exams = examsByIds(pathway.entranceExams);
  const careers = careersForPathway(pathway.id);
  const fit = fitForPathway(profile, pathway);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none">{pathway.emoji}</span>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-slate-900 leading-snug">{pathway.name}</h1>
          <div className="flex flex-wrap gap-1 mt-1.5">
            <Tag tone="indigo">{pathway.durationLabel}</Tag>
            <Tag tone={pathway.risk === 'safe' ? 'emerald' : pathway.risk === 'ambitious' ? 'rose' : 'amber'}>
              {pathway.risk} route
            </Tag>
          </div>
        </div>
        <ScoreBadge score={fit} />
      </div>

      <Card>
        <p className="text-[11px] text-slate-700 leading-relaxed">{pathway.bestFor}</p>
        <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{pathway.eligibility}</p>
      </Card>

      <SectionTitle>What you actually study</SectionTitle>
      <Card className="space-y-2">
        {pathway.syllabus.map((s) => (
          <Bullet key={s} tone="indigo">
            {s}
          </Bullet>
        ))}
        <div className="pt-2 border-t border-slate-50">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Recognised under</p>
          {pathway.boards.map((b) => (
            <p key={b} className="text-[10px] text-slate-600 leading-relaxed">
              {b}
            </p>
          ))}
        </div>
      </Card>

      <SectionTitle hint="the parent question">What it costs</SectionTitle>
      <Card>
        <KeyValue label="Government" value={pathway.cost.government} />
        <KeyValue label="Private" value={pathway.cost.private} />
      </Card>

      <SectionTitle>Entrance exams on this route</SectionTitle>
      {exams.length === 0 ? (
        <Card>
          <p className="text-[11px] text-slate-500">
            No separate entrance test — admission is usually merit-based or through the state counselling portal.
          </p>
        </Card>
      ) : null}
      <div className="space-y-2">
        {exams.map((exam) => (
          <Card key={exam.id} onClick={() => onOpenExam(exam.id)} className="flex items-center justify-between">
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-slate-900">{exam.shortName}</h4>
              <p className="text-[9px] text-slate-500 truncate">{exam.conductedBy}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Tag tone={exam.level === 'national' ? 'indigo' : 'amber'}>{exam.level}</Tag>
              <span className="text-[10px] font-bold text-indigo-600">view</span>
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle>Where this route leads</SectionTitle>
      <Card className="space-y-2">
        {pathway.nextSteps.map((s) => (
          <Bullet key={s} tone="indigo">
            <GraduationCap className="w-3 h-3 inline -mt-0.5 mr-0.5" />
            {s}
          </Bullet>
        ))}
      </Card>
      
      <SectionTitle hint="government">Jobs you can aim for</SectionTitle>
      <Card className="space-y-2">
        {pathway.govtJobs.map((j) => (
          <Bullet key={j} tone="emerald">
            <Landmark className="w-3 h-3 inline -mt-0.5 mr-0.5" />
            {j}
          </Bullet>
        ))}
      </Card>

      <SectionTitle hint="private">Private sector options</SectionTitle>
      <Card className="space-y-2">
        {pathway.privateJobs.map((j) => (
          <Bullet key={j} tone="indigo">
            <TrendingUp className="w-3 h-3 inline -mt-0.5 mr-0.5" />
            {j}
          </Bullet>
        ))}
      </Card>

      {careers.length > 0 ? (
        <>
          <SectionTitle hint="with salary bands">Detailed career cards</SectionTitle>
          <div className="space-y-2">
            {careers.map((career) => (
              <Card key={career.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[11px] font-bold text-slate-900">
                    {career.emoji} {career.title}
                  </h4>
                  <Tag tone={career.sector === 'govt' ? 'emerald' : career.sector === 'private' ? 'indigo' : 'slate'}>
                    {career.sector}
                  </Tag>
                </div>
                <KeyValue label="Start" value={career.startingBand} />
                <KeyValue label="Experienced" value={career.experiencedBand} />
                <p className="text-[10px] text-slate-500 leading-relaxed pt-1">👨‍👩‍👧 {career.parentNote}</p>
              </Card>
            ))}
          </div>
        </>
      ) : null}

      <SectionTitle>The honest trade-off</SectionTitle>
      <Card className="space-y-2.5">
        <div>
          <h4 className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mb-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
          </h4>
          {pathway.pros.map((p) => (
            <Bullet key={p} tone="emerald">
              {p}
            </Bullet>
          ))}
        </div>
        <div>
          <h4 className="text-[11px] font-bold text-rose-700 flex items-center gap-1 mb-1.5">
            <XCircle className="w-3.5 h-3.5" /> Risks and costs
          </h4>
          {pathway.cons.map((c) => (
            <Bullet key={c} tone="rose">
              {c}
            </Bullet>
          ))}
        </div>
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-50">
          <Clock className="w-3 h-3 text-slate-400" />
          <p className="text-[10px] text-slate-500">
            Roughly {pathway.durationYears} years of study before the main qualification.
          </p>
        </div>
      </Card>

      <SectionTitle>Official links</SectionTitle>
      <Card>
        <LinkList links={pathway.links} />
      </Card>

      <VerificationNote />
    </div>
  );
}