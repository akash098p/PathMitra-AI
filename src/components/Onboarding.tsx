'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import { QUALIFICATIONS } from '@/data/qualifications';
import { interestQuestionsFor, tallyInterests } from '@/data/interests';
import { findStageGuide } from '@/data/nextsteps';
import { BUDGET_LABELS, MOBILITY_LABELS, PRIORITY_LABELS, RISK_LABELS, EMPTY_PROFILE } from '@/lib/profile';
import { scorePathways } from '@/lib/recommend';
import type { BudgetBand, InterestId, Mobility, PriorityId, RiskAppetite, StudentProfile } from '@/lib/types';
import { Bullet, Card, Chip, PrimaryButton, ScoreBadge, SectionTitle, Tag, TrustNote } from '@/components/ui';

// ============================================================================
// Onboarding — the student is never assumed.
// Step 1: who you are. Step 2: what you enjoy. Step 3: family constraints.
// Step 4: what PathMitra recommends and why.
// ============================================================================
const PRIORITY_IDS: PriorityId[] = [
  'low-fees',
  'quick-earning',
  'govt-job',
  'high-salary',
  'nearby-college',
  'higher-studies',
  'respect-family',
];

export function Onboarding({
  initial,
  onComplete,
  onCancel,
}: {
  initial: StudentProfile;
  onComplete: (profile: StudentProfile) => void;
  onCancel?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<StudentProfile>({ ...EMPTY_PROFILE, ...initial });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const stepContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stepContentRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [step]);

  const patch = (part: Partial<StudentProfile>) => {
    // The quiz is written per stage, so changing the stage invalidates the
    // answers given for the previous question set.
    if (part.qualification && part.qualification !== profile.qualification) setAnswers({});
    setProfile((prev) => ({ ...prev, ...part }));
  };

  const qualificationMeta = QUALIFICATIONS.find((q) => q.id === profile.qualification);
  const quizQuestions = useMemo(() => interestQuestionsFor(profile.qualification), [profile.qualification]);
  const stageGuide = useMemo(() => findStageGuide(profile.qualification), [profile.qualification]);
  const previewRecommendations = useMemo(
    () => (profile.interests.length > 0 ? scorePathways(profile, 3) : []),
    [profile],
  );

  const canContinue = step === 1 ? Boolean(profile.qualification) : true;

  function finishInterestStep() {
    const interests = tallyInterests(answers, quizQuestions) as InterestId[];
    patch({ interests });
    setStep(3);
  }
  const stepTitles = ['Welcome', 'Where you are', 'What you enjoy', 'Family constraints', 'Your matches'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition ${i <= step ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
            Step {Math.min(step + 1, 5)} of 5
          </span>
          <span className="text-[10px] text-slate-400">{stepTitles[step]}</span>
        </div>
      </div>

      <div ref={stepContentRef} className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {step === 0 && (
          <>
            <div className="text-center pt-4">
              <div className="relative mx-auto mb-3 h-[290px] w-full max-w-[390px] overflow-hidden rounded-[2rem] bg-[#edf4ff]">
                <span aria-hidden="true" className="absolute -right-10 -top-12 h-40 w-40 rotate-12 rounded-[42%] bg-[#c9e8ff]" />
                <span aria-hidden="true" className="absolute -left-12 bottom-5 h-24 w-52 -rotate-6 rounded-[45%] bg-[#d8f5df]" />
                <span aria-hidden="true" className="absolute bottom-[-2rem] right-8 h-24 w-36 rotate-[-18deg] rounded-full border-[10px] border-[#ffd98a]" />
                <span aria-hidden="true" className="absolute left-10 top-8 h-5 w-5 rounded-full bg-[#ffb4c8]" />
                <Image
                  src="/welcome.png"
                  alt="Student exploring education and career paths"
                  width={390}
                  height={290}
                  className="relative z-10 h-full w-full object-contain"
                />
              </div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                Namaste! I am PathMitra,
                <br />
                your education to career guide
              </h1>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed px-2">
                I do not have a ready-made answer for you. First I will ask six short questions about your stage,
                what you enjoy, and what your family can manage — then I will show the routes that actually fit,
                with their real strengths and risks.
              </p>
            </div>

            <Card>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Your name (optional)
              </label>
              <input
                value={profile.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="Leave blank if you prefer"
                className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-2">
                Nothing leaves this device. Your answers are saved only in this browser.
              </p>
            </Card>

            <TrustNote />
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Where are you right now?</h2>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Choose the one that matches today. Only routes that fit your stage will be suggested next.
              </p>
            </div>
            <div className="space-y-2">
              {QUALIFICATIONS.map((q) => {
                const active = profile.qualification === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => patch({ qualification: q.id })}
                    className={`cursor-pointer rounded-2xl border p-3.5 flex items-start gap-3 transition ${
                      active ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    <span className="text-xl leading-none mt-0.5">{q.emoji}</span>
                    <div className="flex-1">
                      <h3 className="text-xs font-bold text-slate-900">{q.label}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{q.helper}</p>
                    </div>
                    {active ? <span className="text-indigo-600 text-xs font-bold">✓</span> : null}
                  </div>
                );
              })}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                <Tag tone="indigo">{qualificationMeta?.label ?? 'Your stage'}</Tag>
                <Tag tone="emerald">{quizQuestions.length} questions</Tag>
              </div>
              <h2 className="text-sm font-bold text-slate-900">What you enjoy — asked for your stage</h2>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                These questions are written for {qualificationMeta?.label ?? 'your stage'}, so they ask about work you can
                actually judge today. Your answers drive every match, score and roadmap step you see next.
              </p>
            </div>
            <div className="space-y-4">
              {quizQuestions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 leading-relaxed">{question.prompt}</h3>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => {
                      const active = answers[question.id] === optionIndex;
                      return (
                        <div
                          key={`${question.id}-${option.label}`}
                          onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))}
                          className={`cursor-pointer rounded-2xl border p-3.5 flex items-start gap-3 transition ${
                            active ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200 hover:border-indigo-400'
                          }`}
                        >
                          <span className="text-lg leading-none mt-0.5">{option.emoji}</span>
                          <p className="text-[11px] text-slate-800 flex-1 leading-relaxed">{option.label}</p>
                          {active ? <span className="text-indigo-600 text-xs font-bold">✓</span> : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div>
              <h2 className="text-sm font-bold text-slate-900">What can your family realistically manage?</h2>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Honest answers here give you useful advice. PathMitra will not push a route you cannot afford.
              </p>
            </div>
            <Card>
              <SectionTitle hint="per year">Fee budget</SectionTitle>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Object.entries(BUDGET_LABELS).map(([id, label]) => (
                  <Chip key={id} active={profile.budget === id} onClick={() => patch({ budget: id as BudgetBand })}>{label}</Chip>
                ))}
              </div>
            </Card>
            <Card>
              <SectionTitle>How far can you travel to study?</SectionTitle>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Object.entries(MOBILITY_LABELS).map(([id, label]) => (
                  <Chip key={id} active={profile.mobility === id} onClick={() => patch({ mobility: id as Mobility })}>{label}</Chip>
                ))}
              </div>
            </Card>
            <Card>
              <SectionTitle>How much risk is comfortable?</SectionTitle>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Object.entries(RISK_LABELS).map(([id, label]) => (
                  <Chip key={id} active={profile.risk === id} onClick={() => patch({ risk: id as RiskAppetite })}>{label}</Chip>
                ))}
              </div>
            </Card>
            <Card>
              <SectionTitle hint="pick any">What matters most to your family?</SectionTitle>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {PRIORITY_IDS.map((id) => (
                  <Chip
                    key={id}
                    active={profile.priorities.includes(id)}
                    onClick={() =>
                      patch({
                        priorities: profile.priorities.includes(id)
                          ? profile.priorities.filter((x) => x !== id)
                          : [...profile.priorities, id],
                      })
                    }
                  >
                    {PRIORITY_LABELS[id]}
                  </Chip>
                ))}
              </div>
            </Card>
          </>
        )}
        {step === 4 && (
          <>
            <div>
              <h2 className="text-sm font-bold text-slate-900">These fit you best right now</h2>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                This is a starting point, not a verdict. Every card explains why it matched you and what the risks are.
              </p>
            </div>
            {previewRecommendations.length === 0 ? (
              <Card className="text-center">
                <p className="text-[11px] text-slate-500">
                  Choose your current stage and answer a few interest questions so the matches can be calculated.
                </p>
              </Card>
            ) : null}
            {previewRecommendations.map((rec) => (
              <Card key={rec.pathway.id} className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-2.5 items-start">
                    <span className="text-xl leading-none mt-0.5">{rec.pathway.emoji}</span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{rec.pathway.shortName}</h3>
                      <p className="text-[10px] text-slate-500">{rec.pathway.durationLabel}</p>
                    </div>
                  </div>
                  <ScoreBadge score={rec.score} />
                </div>
                {rec.reasons.slice(0, 2).map((r, i) => (
                  <Bullet key={i} tone="emerald">{r}</Bullet>
                ))}
                {rec.cautions.slice(0, 1).map((c, i) => (
                  <Bullet key={i} tone="amber">{c}</Bullet>
                ))}
              </Card>
            ))}
            {stageGuide ? (
              <>
                <SectionTitle hint="also in the Guide tab">Your first moves at this stage</SectionTitle>
                {stageGuide.nextBest.slice(0, 2).map((card) => (
                  <Card key={card.id} className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-900 leading-snug">{card.title}</h3>
                      <Tag tone="sky">{card.category}</Tag>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-relaxed">{card.why}</p>
                    <p className="text-[10px] font-semibold text-slate-700">⏱ {card.timeline}</p>
                  </Card>
                ))}
                <Card className="bg-emerald-50/70 border-emerald-100">
                  <p className="text-[10px] text-emerald-900 leading-relaxed">
                    The Roadmap tab turns these into a tickable checklist with {stageGuide.nextBest.length} moves, your
                    placement checklist and the exams to track — saved on this device.
                  </p>
                </Card>
              </>
            ) : null}
            <Card className="bg-indigo-50/70 border-indigo-100">
              <p className="text-[10px] text-indigo-900 leading-relaxed flex gap-1.5">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  You can change any answer later from the Profile tab, and the recommendations update instantly.
                </span>
              </p>
            </Card>
          </>
        )}
      </div>
      <div className="px-4 py-3 border-t border-slate-100 bg-white space-y-2">
        <div className="flex gap-2">
          {step > 0 && step < 4 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 text-xs font-semibold"
            >
              Back
            </button>
          ) : null}
          {step === 0 && <PrimaryButton onClick={() => setStep(1)}>Begin with my stage</PrimaryButton>}
          {step === 1 && (
            <PrimaryButton onClick={() => setStep(2)} disabled={!canContinue}>
              {canContinue ? "Next: what do you enjoy?" : "Choose your current stage"}
            </PrimaryButton>
          )}
          {step === 2 && (
            <PrimaryButton
              onClick={() => finishInterestStep()}
              disabled={quizQuestions.some((question) => answers[question.id] === undefined)}
            >
              Continue to family constraints
            </PrimaryButton>
          )}
          {step === 3 && <PrimaryButton onClick={() => setStep(4)}>Show my matches</PrimaryButton>}
          {step === 4 && (
            <PrimaryButton onClick={() => onComplete({ ...profile, onboarded: true })}>
              Start exploring PathMitra
            </PrimaryButton>
          )}
        </div>
        {step === 0 && onCancel ? (
          <button onClick={onCancel} className="w-full text-[10px] text-slate-400 py-1">
            I already have a saved profile — skip this
          </button>
        ) : null}
        {step === 1 && qualificationMeta ? (
          <p className="text-[10px] text-slate-400 text-center">
            Only routes open to {qualificationMeta.label} will be suggested.
          </p>
        ) : null}
        {step === 2 ? (
          <p className="text-[10px] text-slate-400 text-center">
            Answer honestly — these answers drive the matches, scores and roadmap for your stage.
          </p>
        ) : null}
      </div>
    </div>
  );
}
