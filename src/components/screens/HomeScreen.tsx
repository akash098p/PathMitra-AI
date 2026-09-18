'use client';

import React from 'react';
import {
  Award,
  BarChart2,
  Bot,
  ChevronRight,
  ChevronLeft,
  Landmark,
  Map as MapIcon,
  Scale,
  Wallet,
  GraduationCap,
} from 'lucide-react';
import { scorePathways } from '@/lib/recommend';
import { INTERESTS, QUALIFICATIONS } from '@/data/qualifications';
import type { StudentProfile } from '@/lib/types';
import { Bullet, Card, ScoreBadge, SectionTitle, Tag, TrustNote } from '@/components/ui';

// ============================================================================
// Home — the personalised dashboard. Everything shown here depends on the
// student profile, so two different students never see the same screen.
// ============================================================================

const QUICK_ACTIONS = [
  { id: 'exams', label: 'Entrance exams', hint: 'JEE, NEET, JEXPO, NDA', icon: <Award className="w-4 h-4" />, tone: 'bg-amber-50 text-amber-600' },
  { id: 'careers', label: 'Govt vs private jobs', hint: 'Roles, salary, stability', icon: <Landmark className="w-4 h-4" />, tone: 'bg-emerald-50 text-emerald-600' },
  { id: 'scenarios', label: 'What-if simulator', hint: 'Compare full timelines', icon: <BarChart2 className="w-4 h-4" />, tone: 'bg-sky-50 text-sky-600' },
  { id: 'scholarships', label: 'Fees & scholarships', hint: 'NSP, AICTE, state schemes', icon: <Wallet className="w-4 h-4" />, tone: 'bg-rose-50 text-rose-600' },
  { id: 'skills', label: 'Skill tracks', hint: 'Start learning now', icon: <GraduationCap className="w-4 h-4" />, tone: 'bg-indigo-50 text-indigo-600' },
  { id: 'roadmap', label: 'My roadmap', hint: 'Step-by-step checklist', icon: <MapIcon className="w-4 h-4" />, tone: 'bg-violet-50 text-violet-600' },
];

export function HomeScreen({
  profile,
  onOpenScreen,
  onOpenPathway,
  back,
}: {
  profile: StudentProfile;
  onOpenScreen: (screen: string) => void;
  onOpenPathway: (pathwayId: string) => void;
  back?: () => void;
}) {
  const recommendations = scorePathways(profile, 3);
  const qualification = QUALIFICATIONS.find((q) => q.id === profile.qualification);
  const displayName = profile.name ? `, ${profile.name}` : '';
  const interestCount = profile.interests.length;

  return (
    <div className="p-4 space-y-4">
      <header className="py-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">PathMitra AI</p>
        <h1 className="text-base font-bold text-slate-900 leading-tight">Namaste{displayName} 👋</h1>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {qualification ? qualification.label : 'Tell me where you are to get matches'}
        </p>
        {interestCount > 0 ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {profile.interests.slice(0, 4).map((i) => (
              <Tag key={i} tone="indigo">
                {INTERESTS[i]?.emoji} {INTERESTS[i]?.label}
              </Tag>
            ))}
            {interestCount > 4 ? <Tag>+{interestCount - 4}</Tag> : null}
          </div>
        ) : null}
      </header>

      <SectionTitle hint="based on your answers">Your closest matches</SectionTitle>
      {recommendations.length === 0 ? (
        <Card className="text-center">
          <p className="text-[11px] text-slate-500">
            Complete the short onboarding so recommendations can be calculated for your stage and interests.
          </p>
        </Card>
      ) : null}
      <div className="space-y-2.5">
        {recommendations.map((rec) => (
          <Card key={rec.pathway.id} onClick={() => onOpenPathway(rec.pathway.id)} className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-2.5 items-start">
                <span className="text-xl leading-none mt-0.5">{rec.pathway.emoji}</span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{rec.pathway.shortName}</h3>
                  <p className="text-[10px] text-slate-500">{rec.pathway.durationLabel}</p>
                  <div className="flex gap-1 mt-1.5">
                    <Tag tone="slate">govt fee {rec.pathway.cost.government.replace(' per year', '')}</Tag>
                  </div>
                </div>
              </div>
              <ScoreBadge score={rec.score} />
            </div>
            {rec.reasons[0] ? <Bullet tone="emerald">{rec.reasons[0]}</Bullet> : null}
            {rec.cautions[0] ? <Bullet tone="amber">{rec.cautions[0]}</Bullet> : null}
            <p className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 pt-0.5">
              View full route <ChevronRight className="w-3 h-3" />
            </p>
          </Card>
        ))}
      </div>
      
      <SectionTitle>Everything else in the guide</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        {QUICK_ACTIONS.map((action) => (
          <div
            key={action.id}
            onClick={() => onOpenScreen(action.id)}
            className="cursor-pointer bg-white rounded-2xl p-3 border border-slate-100 shadow-xs hover:border-indigo-200 transition"
          >
            <div className={`p-2 rounded-xl w-fit mb-2 ${action.tone}`}>{action.icon}</div>
            <h4 className="text-[11px] font-bold text-slate-900 leading-snug">{action.label}</h4>
            <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">{action.hint}</p>
          </div>
        ))}
      </div>

      <Card onClick={() => onOpenScreen('compare')} className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Scale className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-[11px] font-bold text-slate-900">Side-by-side comparison</h4>
            <p className="text-[9px] text-slate-500">Fees, exams and jobs for 2–3 routes</p>
          </div>
        </div>
        {back ? (
          <button
            onClick={back}
            className="p-1.5 rounded-full hover:bg-slate-100 transition"
            aria-label="Back to home"
          >
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </Card>

      <Card onClick={() => onOpenScreen('advisor')} className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-slate-900 text-white">
            <Bot className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-[11px] font-bold text-slate-900">Ask the advisor anything</h4>
            <p className="text-[9px] text-slate-500">It answers from the same verified data</p>
          </div>
        </div>
        {back ? (
          <button
            onClick={back}
            className="p-1.25 rounded-full hover:bg-slate-100 transition"
            aria-label="Back to home"
          >
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </Card>

      <TrustNote />
    </div>
  );
}