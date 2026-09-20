'use client';

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { EXAMS, findExam } from '@/data/exams';
import { QUALIFICATIONS } from '@/data/qualifications';
import type { StudentProfile } from '@/lib/types';
import { Bullet, Card, Chip, EmptyState, KeyValue, LinkList, Meter, SectionTitle, Tag, VerificationNote } from '@/components/ui';

// ============================================================================
// Exam tracker — all-India and state entrance tests, with eligibility, what
// they unlock, the usual yearly window and the official portal.
// ============================================================================

export function ExamDetailScreen({
  examId,
  profile,
  onToggleSaved,
  onBack,
}: {
  examId: string;
  profile: StudentProfile;
  onToggleSaved: (examId: string) => void;
  onBack: () => void;
}) {
  const exam = findExam(examId);
  if (!exam) {
    return (
      <div className="p-4">
        <Card>
          <p className="text-[11px] text-slate-500">This exam is not in the database yet.</p>
        </Card>
      </div>
    );
  }
  return (
    <div className="p-4 space-y-4">
      <div>
        <div className="flex flex-wrap gap-1 mb-2">
          <Tag tone={exam.level === 'national' ? 'indigo' : 'amber'}>{exam.level}</Tag>
          <Tag tone="slate">{exam.category}</Tag>
        </div>
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900 leading-snug">{exam.name}</h2>
          <button
            type="button"
            aria-label={profile.savedExams.includes(exam.id) ? `Remove ${exam.shortName} from saved exams` : `Save ${exam.shortName}`}
            onClick={() => onToggleSaved(exam.id)}
            className="shrink-0 p-1 text-rose-500"
          >
            <Heart className={`w-4 h-4 ${profile.savedExams.includes(exam.id) ? 'fill-current' : ''}`} />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">{exam.conductedBy}</p>
      </div>

      <Card className="space-y-0">
        <KeyValue label="Eligibility" value={exam.eligibility} />
        <KeyValue label="Grants admission to" value={exam.grants} />
        <KeyValue label="Typical cycle" value={exam.cycleWindow} />
        <KeyValue label="Prep time" value={`About ${exam.prepMonths} months of focused preparation`} />
      </Card>

      <SectionTitle hint="1 is easy, 5 is the toughest">Competition level</SectionTitle>
      <Card>
        <Meter value={exam.difficulty} max={5} tone={exam.difficulty >= 4 ? 'rose' : exam.difficulty >= 3 ? 'amber' : 'emerald'} />
        <div className="flex justify-between mt-1.5">
          <span className="text-[9px] text-slate-400">manageable</span>
          <span className="text-[9px] text-slate-400">extremely competitive</span>
        </div>
      </Card>

      <SectionTitle>What to keep in mind</SectionTitle>
      <Card className="space-y-2">
        <Bullet tone="indigo">{exam.notes}</Bullet>
      </Card>

      <SectionTitle>Official portal</SectionTitle>
      <Card>
        <LinkList links={[{ label: `${exam.shortName} — official portal`, url: exam.officialUrl }]} />
      </Card>

      <VerificationNote />
    </div>
  );
}

export function ExamsScreen({
  profile,
  onOpenExam,
  onToggleSaved,
}: {
  profile: StudentProfile;
  onOpenExam: (examId: string) => void;
  onToggleSaved: (examId: string) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'national' | 'state' | 'mine'>('all');

  const qualificationMeta = QUALIFICATIONS.find((q) => q.id === profile.qualification);
  const visible = EXAMS.filter((exam) => {
    if (filter === 'national') return exam.level === 'national';
    if (filter === 'state') return exam.level === 'state';
    if (filter === 'mine') {
      if (!profile.qualification) return true;
      if (exam.openTo.includes(profile.qualification)) return true;
      // Class 11 students prepare for the same entrance landscape as Class 12.
      if (profile.qualification === 'class11') {
        return (
          exam.openTo.includes('class12-science') ||
          exam.openTo.includes('class12-commerce') ||
          exam.openTo.includes('class12-arts')
        );
      }
      if (profile.qualification === 'btech-student') {
        return exam.id === 'nats' || exam.category.includes('Engineering') || exam.category.includes('University') || exam.category.includes('Postgraduate');
      }
      if (profile.qualification === 'b-ed-student') {
        return exam.id === 'ncet' || exam.category.includes('Teacher education');
      }
      if (profile.qualification === 'medical-student') {
        return exam.category.includes('Medical') || exam.category.includes('Healthcare');
      }
      if (profile.qualification === 'graduate' || profile.qualification === 'postgraduate') {
        return (
          exam.category.includes('Postgraduate') ||
          exam.category.includes('Government Jobs') ||
          exam.category.includes('Management') ||
          exam.category.includes('Teaching') ||
          exam.category.includes('Healthcare') ||
          exam.category.includes('Computer Applications') ||
          exam.category.includes('Apprenticeship')
        );
      }
      return false;
    }
    return true;
  }).sort((a, b) => a.shortName.localeCompare(b.shortName));

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Entrance exams &amp; admission routes</h2>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          {EXAMS.length} exams from NTA, UPSC, state boards and professional councils — with what each one actually
          unlocks.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
          All
        </Chip>
        <Chip active={filter === 'national'} onClick={() => setFilter('national')}>
          All-India
        </Chip>
        <Chip active={filter === 'state'} onClick={() => setFilter('state')}>
          State
        </Chip>
        <Chip active={filter === 'mine'} onClick={() => setFilter('mine')}>
          Open to me{qualificationMeta ? ` — ${qualificationMeta.label}` : ''}
        </Chip>
      </div>

      {visible.length === 0 ? <EmptyState title="Nothing matches this filter" body="Try another filter." /> : null}

      <div className="space-y-2">
        {visible.map((exam) => (
          <Card key={exam.id} onClick={() => onOpenExam(exam.id)} className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-900 leading-snug">{exam.name}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{exam.conductedBy}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  aria-label={profile.savedExams.includes(exam.id) ? `Remove ${exam.shortName} from saved exams` : `Save ${exam.shortName}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleSaved(exam.id);
                  }}
                  className="p-1 text-rose-500"
                >
                  <Heart className={`w-4 h-4 ${profile.savedExams.includes(exam.id) ? 'fill-current' : ''}`} />
                </button>
                <Tag tone={exam.level === 'national' ? 'indigo' : 'amber'}>{exam.level}</Tag>
              </div>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed line-clamp-2">{exam.grants}</p>
            <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-50">
              <Tag tone="slate">{exam.cycleWindow.split('–')[0].trim()}…</Tag>
              <Tag tone={exam.difficulty >= 4 ? 'rose' : exam.difficulty >= 3 ? 'amber' : 'emerald'}>
                competition {exam.difficulty}/5
              </Tag>
              <span className="text-[10px] font-bold text-indigo-600 ml-auto">details</span>
            </div>
          </Card>
        ))}
      </div>

      <VerificationNote />
    </div>
  );
}