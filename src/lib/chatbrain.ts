import { EXAMS } from '@/data/exams';
import { PATHWAYS } from '@/data/pathways';
import { CAREERS } from '@/data/careers';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { SKILL_TRACKS } from '@/data/skills';
import { OPPORTUNITIES } from '@/data/opportunities';
import { STATES } from '@/data/states';
import { describeProfile } from '@/lib/profile';
import type { Link, StudentProfile } from '@/lib/types';

// ============================================================================
// Grounded brain.
// Before spending a single LLM token, PathMitra tries to answer from its own
// verified datasets. Answers are assembled from the same data the screens use,
// so what the student reads in chat always matches what the app displays.
// ============================================================================

export interface LocalAnswer {
  reply: string;
  source: string;
  usedLinks: string[];
}

const LINK_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'what', 'which', 'after', 'about', 'class',
  'best', 'from', 'into', 'does', 'have', 'exam', 'jobs', 'job', 'india',
]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !LINK_STOPWORDS.has(t));
}

function scoreMatch(haystack: string, queryTokens: string[]): number {
  const hay = haystack.toLowerCase();
  let score = 0;
  for (const token of queryTokens) {
    if (hay.includes(token)) score += 1;
  }
  return score;
}

function bullet(text: string): string {
  return `• ${text}`;
}

function linkBlock(links: Link[]): string {
  const unique = links.filter((l, i, arr) => arr.findIndex((x) => x.url === l.url) === i).slice(0, 3);
  if (unique.length === 0) return '';
  return ['', '🔗 Official links for details:', ...unique.map((l) => `[${l.label}](${l.url})`)].join('\n');
}

function examAnswer(id: string): LocalAnswer | null {
  const exam = EXAMS.find((e) => e.id === id);
  if (!exam) return null;
  const reply = [
    `🎯 **${exam.name}**`,
    '',
    bullet(`Conducted by: ${exam.conductedBy}`),
    bullet(`Who can apply: ${exam.eligibility}`),
    bullet(`What it gives: ${exam.grants}`),
    bullet(`Typical cycle: ${exam.cycleWindow} — always confirm current dates on the official portal`),
    bullet(`Prep effort: roughly ${exam.prepMonths} months of serious preparation`),
    bullet(`Note: ${exam.notes}`),
    linkBlock([{ label: `${exam.shortName} official portal`, url: exam.officialUrl }]),
  ].join('\n');
  return { reply, source: 'brain-cache:exam', usedLinks: [exam.officialUrl] };
}

function pathwayAnswer(id: string): LocalAnswer | null {
  const p = PATHWAYS.find((x) => x.id === id);
  if (!p) return null;
  const reply = [
    `${p.emoji} **${p.name}**`,
    '',
    bullet(`Duration: ${p.durationLabel}`),
    bullet(`Eligibility: ${p.eligibility}`),
    bullet(`Government cost: ${p.cost.government}`),
    bullet(`Private cost: ${p.cost.private}`),
    bullet(`Best suited for: ${p.bestFor}`),
    '',
    '**What you actually study:**',
    ...p.syllabus.slice(0, 3).map((s) => `- ${s}`),
    '',
    '**Where it leads:**',
    ...p.nextSteps.slice(0, 3).map((s) => `- ${s}`),
    '',
    '**Honest trade-off:**',
    bullet(`Strength: ${p.pros[0]}`),
    bullet(`Watch out: ${p.cons[0]}`),
    linkBlock(p.links),
  ].join('\n');
  return { reply, source: 'brain-cache:pathway', usedLinks: p.links.map((l) => l.url) };
}

function careerAnswer(id: string): LocalAnswer | null {
  const c = CAREERS.find((x) => x.id === id);
  if (!c) return null;
  const sectorLabel =
    c.sector === 'govt' ? 'Government' : c.sector === 'private' ? 'Private sector' : 'Government and private both';
  const reply = [
    `${c.emoji} **${c.title}**`,
    '',
    bullet(`Sector: ${sectorLabel}`),
    bullet(`Minimum qualification: ${c.minimumQualification}`),
    bullet(`Starting pay: ${c.startingBand}`),
    bullet(`After 5–8 years: ${c.experiencedBand}`),
    bullet(`Demand outlook: ${c.demandOutlook}`),
    bullet(`For parents: ${c.parentNote}`),
    '',
    '**Growth ladder:**',
    ...c.growthPath.map((g) => `- ${g}`),
    '',
    '**Who hires:**',
    ...c.hiringBodies.slice(0, 3).map((h) => `- ${h}`),
  ].join('\n');
  return { reply, source: 'brain-cache:career', usedLinks: [] };
}

function scholarshipAnswer(profile: StudentProfile): LocalAnswer {
  const eligible = SCHOLARSHIPS.filter(
    (s) => !profile.qualification || s.appliesToQualification.includes(profile.qualification),
  );
  const list = (eligible.length > 0 ? eligible : SCHOLARSHIPS).slice(0, 4);
  const reply = [
    '🎓 **Scholarships and fee support worth checking**',
    '',
    ...list.map((s) => bullet(`**${s.name}** — ${s.benefits} (${s.provider})`)),
    '',
    'Keep these ready before applying: income certificate, category certificate if applicable, a bank account in the student name, Aadhaar and the previous marksheet.',
    linkBlock(list.map((s) => s.portal)),
  ].join('\n');
  return { reply, source: 'brain-cache:scholarships', usedLinks: list.map((s) => s.portal.url) };
}

function lateralEntryAnswer(): LocalAnswer {
  const poly = PATHWAYS.find((x) => x.id === 'polytechnic');
  const jelet = EXAMS.find((e) => e.id === 'jelet');
  const reply = [
    '🔄 **Yes — diploma holders can enter B.Tech in the 2nd year without JEE Main**',
    '',
    bullet('AICTE norms allow 3-year diploma holders lateral entry into the 3rd semester of B.Tech/B.E.'),
    bullet('Admission is through the state lateral entry test, for example JELET in West Bengal, with equivalents in other states.'),
    bullet('This saves a full year compared with the normal 4-year B.Tech route.'),
    bullet('Timeline: Class 10 → 3-year diploma → lateral entry → 3 more years of B.Tech.'),
    bullet(`Watch out: ${poly?.cons[0] ?? 'verify that the college is AICTE approved before joining'}`),
    linkBlock([
      { label: 'AICTE lateral entry norms', url: 'https://www.aicte-india.org' },
      ...(jelet ? [{ label: 'JELET (West Bengal)', url: jelet.officialUrl }] : []),
    ]),
  ].join('\n');
  return { reply, source: 'brain-cache:lateral-entry', usedLinks: ['https://www.aicte-india.org'] };
}
export function answerLocally(question: string, profile: StudentProfile): LocalAnswer | null {
  const q = question.toLowerCase();
  const queryTokens = tokens(question);

  // 1. High-frequency intent rules first.
  const lateralIntent =
    (q.includes('lateral') || q.includes('2nd year') || q.includes('second year') || q.includes('without jee')) &&
    (q.includes('diploma') || q.includes('polytechnic') || q.includes('b.tech') || q.includes('btech'));
  if (lateralIntent) return lateralEntryAnswer();

  if (q.includes('scholarship') || q.includes('freeship') || q.includes('fee waiver')) {
    return scholarshipAnswer(profile);
  }

  // 2. Exam match by name and short name.
  let bestExam = { id: '', score: 0 };
  for (const exam of EXAMS) {
    const haystack = `${exam.name} ${exam.shortName} ${exam.category} ${exam.grants}`;
    const score = scoreMatch(haystack, queryTokens) + (q.includes(exam.shortName.toLowerCase()) ? 6 : 0);
    if (score > bestExam.score) bestExam = { id: exam.id, score };
  }
  if (bestExam.score >= 2) {
    const answer = examAnswer(bestExam.id);
    if (answer) return answer;
  }

  // 3. Pathway match.
  let bestPathway = { id: '', score: 0 };
  for (const p of PATHWAYS) {
    const haystack = `${p.name} ${p.shortName} ${p.bestFor} ${p.syllabus.join(' ')}`;
    const score = scoreMatch(haystack, queryTokens) + (q.includes(p.shortName.toLowerCase()) ? 6 : 0);
    if (score > bestPathway.score) bestPathway = { id: p.id, score };
  }
  if (bestPathway.score >= 2) {
    const answer = pathwayAnswer(bestPathway.id);
    if (answer) return answer;
  }

  // 4. Career match.
  let bestCareer = { id: '', score: 0 };
  for (const c of CAREERS) {
    const haystack = `${c.title} ${c.minimumQualification} ${c.hiringBodies.join(' ')} ${c.growthPath.join(' ')}`;
    const score = scoreMatch(haystack, queryTokens);
    if (score > bestCareer.score) bestCareer = { id: c.id, score };
  }
  if (bestCareer.score >= 2) {
    const answer = careerAnswer(bestCareer.id);
    if (answer) return answer;
  }

  // 5. State-specific question.
  for (const state of STATES) {
    if (q.includes(state.name.toLowerCase())) {
      const exams = state.keyExams
        .map((id) => EXAMS.find((e) => e.id === id))
        .filter((e): e is NonNullable<typeof e> => Boolean(e));
      const reply = [
        `📍 **${state.name} — what matters locally**`,
        '',
        bullet(`School boards: ${state.schoolBoards.join(', ')}`),
        bullet(`Technical board: ${state.technicalBoard}`),
        bullet(`Key entrance routes: ${exams.map((e) => `${e.shortName} (${e.conductedBy})`).join('; ') || 'state counselling portals'}`),
        bullet(`Languages you can study and ask in: ${state.languages.join(', ')}`),
        bullet(`Local context: ${state.notes}`),
        linkBlock(state.portals),
      ].join('\n');
      return { reply, source: 'brain-cache:state', usedLinks: state.portals.map((p) => p.url) };
    }
  }

  // 6. Skills, apprenticeships and general direction.
  if (q.includes('skill') || q.includes('learn') || q.includes('course') || q.includes('project')) {
    const tracks = SKILL_TRACKS.filter(
      (t) => profile.interests.length === 0 || t.fits.some((f) => profile.interests.includes(f)),
    ).slice(0, 3);
    const reply = [
      '🛠️ **Skills you can start building right now — no degree needed**',
      '',
      ...tracks.map((t) =>
        bullet(`**${t.name}** (${t.weeklyHours}) — first milestone: ${t.milestones[0]}; first project: ${t.beginnerProjects[0]}`),
      ),
      '',
      'Give it 6–10 focused hours a week. A finished project with a public link beats a certificate alone.',
      linkBlock(tracks.flatMap((t) => t.resources).slice(0, 3)),
    ].join('\n');
    return { reply, source: 'brain-cache:skills', usedLinks: tracks.flatMap((t) => t.resources.map((r) => r.url)) };
  }

  if (q.includes('apprentice') || q.includes('internship') || q.includes('stipend')) {
    const items = OPPORTUNITIES.filter((o) => o.type === 'apprenticeship' || o.type === 'internship').slice(0, 4);
    const reply = [
      '🧰 **Paid training routes: apprenticeships and internships**',
      '',
      ...items.map((o) => bullet(`**${o.name}** — ${o.eligibility}. ${o.stipend}`)),
      '',
      profileSummary(profile) ? `Your profile so far: ${profileSummary(profile)}` : '',
      linkBlock(items.map((o) => o.portal)),
    ].filter(Boolean).join('\n');
    return { reply, source: 'brain-cache:opportunities', usedLinks: items.map((o) => o.portal.url) };
  }

  return null;
}

export function profileSummary(profile: StudentProfile): string {
  return profile.qualification ? describeProfile(profile) : '';
}