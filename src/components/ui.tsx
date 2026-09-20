'use client';

import React from 'react';
import { Bell, ChevronLeft, ExternalLink, GraduationCap, ShieldCheck, Info } from 'lucide-react';
import type { Link } from '@/lib/types';

// ============================================================================
// Shared UI primitives. Every screen composes these so spacing, colour and
// typography stay identical across the whole guide.
// ============================================================================

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white sm:bg-slate-900 flex items-center justify-center p-0 sm:p-6">
      <div className="relative w-full max-w-[430px] h-[100dvh] sm:h-[900px] bg-white sm:rounded-[42px] shadow-2xl overflow-hidden border-0 sm:border-[8px] border-[#eee9e3] flex flex-col">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <span className="absolute -left-24 top-24 h-64 w-64 rounded-full bg-[#fff3eb]/55" />
          <span className="absolute -right-28 top-[-3rem] h-72 w-72 rounded-[42%] rotate-12 bg-[#f5f1ff]/50" />
          <span className="absolute bottom-24 -right-20 h-64 w-64 rounded-full bg-[#effbf4]/55" />
          <span className="absolute bottom-[-5rem] left-10 h-36 w-56 -rotate-12 rounded-[45%] bg-[#fffbea]/60" />
          <span className="absolute left-8 top-1/2 h-20 w-20 rounded-full border-[10px] border-[#ffede5]/60" />
          <span className="absolute right-10 top-1/3 h-5 w-5 rounded-full bg-[#fce6ed]/60" />
        </div>
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const fallbackRight = (
    <button
      aria-label="Notifications"
      className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
    >
      <Bell className="w-4 h-4" />
    </button>
  );

  return (
    <header className="px-2 pt-2 pb-1">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs px-3 py-2.5 flex items-center gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {onBack ? (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="text-[11px] font-black uppercase tracking-[0.12em] text-indigo-700 truncate">{title}</h2>
            <p className="text-[9px] text-slate-500 truncate">{subtitle ?? 'Your AI Guide to Career'}</p>
          </div>
        </div>

        <div className="w-9 flex justify-end shrink-0">{right ?? fallbackRight}</div>
      </div>
    </header>
  );
}

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const interactive = onClick ? 'cursor-pointer hover:border-indigo-400 active:scale-[0.99] transition' : '';
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-4 ${interactive} ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between pt-1">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{children}</h3>
      {hint ? <span className="text-[10px] text-slate-400">{hint}</span> : null}
    </div>
  );
}

export function Chip({
  children,
  active = false,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`max-w-full px-2.5 py-1 rounded-full text-left text-[10px] font-semibold whitespace-normal break-words border transition ${
        active
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200'
      }`}
    >
      {children}
    </button>
  );
}

export function Tag({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode;
  tone?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';
}) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600',
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-800',
    rose: 'bg-rose-50 text-rose-700',
    sky: 'bg-sky-50 text-sky-700',
    violet: 'bg-violet-50 text-violet-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Bullet({
  children,
  tone = 'indigo',
  symbol,
}: {
  children: React.ReactNode;
  tone?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate';
  symbol?: string;
}) {
  const tones: Record<string, string> = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
    amber: 'bg-amber-500',
    slate: 'bg-slate-400',
  };
  return (
    <div className="flex gap-2 items-start">
      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${tones[tone]}`} />
      <p className="text-[11px] text-slate-700 leading-relaxed">
        {symbol ? <span className="mr-1">{symbol}</span> : null}
        {children}
      </p>
    </div>
  );
}

export function KeyValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2 justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 flex-shrink-0">{label}</span>
      <span className="text-[11px] text-slate-800 text-right leading-snug">{value}</span>
    </div>
  );
}

export function LinkPill({ link }: { link: Link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 mt-1.5 mr-1.5 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[11px] border border-indigo-200 transition"
    >
      <ExternalLink className="w-3 h-3" />
      <span className="max-w-[190px] truncate">{link.label}</span>
    </a>
  );
}

export function LinkList({ links }: { links: Link[] }) {
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap">
      {links.map((l) => (
        <LinkPill key={`${l.url}-${l.label}`} link={l} />
      ))}
    </div>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const tone = score >= 75 ? 'bg-emerald-500' : score >= 55 ? 'bg-indigo-500' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-slate-900 leading-none">{score}</span>
        <span className="text-[8px] text-slate-400 font-semibold uppercase">match</span>
      </div>
      <div className={`w-1 h-12 rounded-full ${tone}`} />
    </div>
  );
}

export function Meter({
  value,
  max = 100,
  tone = 'indigo',
}: {
  value: number;
  max?: number;
  tone?: 'indigo' | 'emerald' | 'amber' | 'rose';
}) {
  const tones: Record<string, string> = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };
  const pct = Math.max(4, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${tones[tone]} rounded-full`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-100 transition text-xs"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3 px-4 rounded-2xl transition text-xs"
    >
      {children}
    </button>
  );
}

export function Toggle({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex bg-slate-100 rounded-xl p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition ${
            value === o.id ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card className="text-center">
      <div className="text-3xl mb-2">🧭</div>
      <h4 className="text-xs font-bold text-slate-900">{title}</h4>
      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{body}</p>
    </Card>
  );
}

export function VerificationNote({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex gap-2 items-start bg-amber-50 border border-amber-100 rounded-2xl p-3">
      <Info className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
      <p className="text-[10px] text-amber-900 leading-relaxed">
        {children ??
          'Exam calendars, fees and income limits change every year. Always confirm current details on the official portal linked on this screen before paying any fee.'}
      </p>
    </div>
  );
}

export function TrustNote() {
  return (
    <div className="flex gap-2 items-start bg-emerald-50 border border-emerald-100 rounded-2xl p-3">
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
      <p className="text-[10px] text-emerald-900 leading-relaxed">
        PathMitra never forces a single career on a student. Every route here shows both its strengths and its risks.
      </p>
    </div>
  );
}