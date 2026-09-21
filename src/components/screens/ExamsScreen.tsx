'use client';

import React, { useState, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { EXAMS, findExam, searchExams } from '@/data/exams';
import { QUALIFICATIONS } from '@/data/qualifications';
import { examsForStage, isExamCloseMatch } from '@/lib/stagematch';
import type { StudentProfile } from '@/lib/types';
import { Bullet, Card, Chip, EmptyState, KeyValue, LinkList, Meter, SectionTitle, Tag, VerificationNote, SearchInput } from '@/components/ui';

// ============================================================================
// Exam tracker — all-India and state entrance tests, with eligibility, what
// they unlock, the usual yearly window and the official portal.
// ============================================================================

export function ExamDetailScreen({
  examId,
  profile,
  onToggleSaved,
}: {
  examId: string;
  profile: StudentProfile;
  onToggleSaved: (examId: string) => void;
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
  openAdvisor,
}: {
  profile: StudentProfile;
  onOpenExam: (examId: string) => void;
  onToggleSaved: (examId: string) => void;
  openAdvisor?: (question: string) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'national' | 'state' | 'mine'>('all');
  const [query, setQuery] = useState('');

  const openAdvisorWithQuery = useCallback(
    (q: string) => {
      if (openAdvisor) openAdvisor(q);
    },
    [openAdvisor],
  );

  const qualificationMeta = QUALIFICATIONS.find((q) => q.id === profile.qualification);
  // Stage-aware: "Open to me" is the level-appropriate list, closest first. It is
  // never empty because same-level exams are included before falling back.
  const mine = examsForStage(profile.qualification).filter((exam) =>
    isExamCloseMatch(exam, profile.qualification),
  );
  // A search query overrides the stage filter: the user is asking to "match the
  // records" across the whole database, not just their stage.
  const searchResult = query.trim().length >= 1 ? searchExams(query.trim(), 12) : null;
  const visible = searchResult
    ? searchResult.exams
    : (filter === 'mine'
        ? mine
        : EXAMS.filter((exam) => {
            if (filter === 'national') return exam.level === 'national';
            if (filter === 'state') return exam.level === 'state';
            return true;
          })
      ).sort((a, b) => a.shortName.localeCompare(b.shortName));

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Entrance exams &amp; admission routes</h2>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          {EXAMS.length} exams from NTA, UPSC, state boards and professional councils — with what each one actually
          unlocks.
        </p>
      </div>

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search exams (e.g. JEE, NEET, state CET)"
        ariaLabel="Search entrance exams"
      />

      {query.trim().length > 0 ? (
        <p className="text-[10px] text-slate-500">
          {searchResult?.similar
            ? `No exact match for “${query}” — showing ${searchResult.exams.length} similar result${searchResult.exams.length === 1 ? '' : 's'}.`
            : `Showing ${searchResult?.exams.length ?? 0} result${(searchResult?.exams.length ?? 0) === 1 ? '' : 's'} for “${query}”.`}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-1.5" hidden={query.trim().length > 0}>
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
          Open to me ({mine.length}){qualificationMeta ? ` — ${qualificationMeta.label}` : ''}
        </Chip>
      </div>

      {visible.length === 0 ? (
        <>
          <EmptyState
            title={query.trim().length > 0 ? `No exams match “${query}”` : 'Nothing matches this filter'}
            body={query.trim().length > 0 ? 'Try a broader term or check the spelling.' : 'Try another filter.'}
          />
          {query.trim().length > 0 && openAdvisorWithQuery ? (
            <Card className="text-center">
              <p className="text-[10px] text-slate-500 leading-relaxed mb-2">
                {searchResult?.similar && searchResult.exams.length > 0
                  ? `No exact exam for “${query}”, but here are the closest matches in this app’s dataset — and the advisor can point you at similar real exams too.`
                  : `This exam isn’t in the dataset yet. Ask the advisor — it will answer from the verified guide and any live AI helper, and cite the exact exam you searched for.`}
              </p>
              <button
                type="button"
                onClick={() => {
                  const q = query.trim();
                  const similar = (searchResult?.similar && searchResult.exams.length > 0)
                    ? searchResult.exams.slice(0, 4).map((e) => e.shortName)
                    : [];
                  const question = similar.length > 0
                    ? `${q} — conducted by, syllabus, eligibility, unlocks, cycle window, difficulty, prep time, portal?\nIf not a separate exam: real route + similar exams.\nClosest in this app: ${similar.join(', ')}.`
                    : `${q} — conducted by, syllabus, eligibility, unlocks, cycle window, difficulty, prep time, portal?\nIf not a separate exam: real route + similar exams.`;
                  openAdvisorWithQuery(question);
                }}
                className="w-full px-3 py-2 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl border border-indigo-600 transition"
              >
                Ask the Advisor about this exam
              </button>
            </Card>
          ) : null}
        </>
      ) : null}

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