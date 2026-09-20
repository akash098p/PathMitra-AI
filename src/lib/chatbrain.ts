import { EXAMS } from '@/data/exams';
import { PATHWAYS } from '@/data/pathways';
import { CAREERS } from '@/data/careers';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { SKILL_TRACKS } from '@/data/skills';
import { OPPORTUNITIES, opportunitiesFor } from '@/data/opportunities';
import { findStageGuide, placementChecklistFor } from '@/data/nextsteps';
import {
  careersForStage,
  isCareerCloseMatch,
  isScholarshipCloseMatch,
  scholarshipsForStage,
} from '@/lib/stagematch';
import { STATES } from '@/data/states';
import { QUALIFICATIONS } from '@/data/qualifications';
import { SCENARIOS, findScenario, formatINR, paybackNote, studyYearsBeforeIncome } from '@/lib/roi';
import { describeProfile } from '@/lib/profile';
import { getTimeGreeting } from '@/lib/greeting';
import type { Link, QualificationId, StudentProfile } from '@/lib/types';

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
  const ordered = scholarshipsForStage(profile.qualification);
  const eligible = ordered.filter((s) => isScholarshipCloseMatch(s, profile.qualification));
  const list = (eligible.length > 0 ? eligible : ordered).slice(0, 4);
  const reply = [
    '🎓 **Scholarships and fee support worth checking**',
    '',
    ...list.map((s) => bullet(`**${s.name}** — ${s.benefits} (${s.provider})`)),
    '',
    'Keep these ready before applying: income certificate, category certificate if applicable, a bank account in the student name, Aadhaar and the previous marksheet.',
    'If you are asking about one specific company, trust or private foundation, its rules are not in this app\'s verified data — check that organisation\'s own portal alongside the National Scholarship Portal list.',
    linkBlock(list.map((s) => s.portal)),
  ].join('\n');
  return { reply, source: 'brain-cache:scholarships', usedLinks: list.map((s) => s.portal.url) };
}

function svmcmAnswer(): LocalAnswer {
  return {
    reply: [
      '🎓 **SVMCM scholarship**',
      '',
      bullet('SVMCM means Swami Vivekananda Merit-cum-Means Scholarship, a West Bengal government scholarship.'),
      bullet('It is generally for meritorious students from families within the notified income limit, from higher secondary through higher education and technical or professional courses.'),
      bullet('Eligibility, marks cut-offs, income ceiling and award amounts depend on the current course and notification.'),
      bullet('Keep your marksheet, income certificate, bank details, Aadhaar and institution verification documents ready.'),
      '',
      'Check the current rules and application window on the official portal before applying.',
      linkBlock([{ label: 'SVMCM official portal', url: 'https://svmcm.wb.gov.in' }]),
    ].join('\n'),
    source: 'brain-cache:scholarship',
    usedLinks: ['https://svmcm.wb.gov.in'],
  };
}

function isGenericScholarshipQuestion(q: string): boolean {
  if (!/scholar(ship)?|scolar(ship)?|freeship|fee waiver/.test(q)) return false;

  const specificMarkers = [
    'indian oil',
    'iocl',
    'corporation',
    'company',
    'foundation',
    'trust',
    'limited',
    'scheme',
    'organization',
    'organisation',
  ];
  return !specificMarkers.some((marker) => q.includes(marker));
}

function isOrganizationScholarshipQuestion(q: string): boolean {
  return /scholar(ship)?|scolar(ship)?|freeship|fee waiver/.test(q) && !isGenericScholarshipQuestion(q);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ----------------------------------------------------------------------------
// Built-in conversational skills: greetings, capabilities, thanks, goodbye.
// These never need the network — instant, warm replies for students testing
// the app ("hello?", "thanks!") instead of falling through to the LLM.
// ----------------------------------------------------------------------------

function smallTalkAnswer(q: string, profile: StudentProfile): LocalAnswer | null {
  const saidName = profile.name ? `, ${profile.name.split(' ')[0]}` : '';
  const trimmed = q.trim();

  if (/^(hi|hii+|hello|hey|namaste|namaskar|good\s?(morning|afternoon|evening)|yo|sup)\b[!.\s]*$/.test(trimmed)) {
    return {
      reply: [
        `👋 **${getTimeGreeting()}${saidName}! I am PathMitra, your education-to-career guide.**`,
        '',
        bullet('Ask me to compare two routes — for example "diploma vs B.Tech in computer science"'),
        bullet('Ask about any exam, scholarship, government or private job, or skill to learn'),
        bullet('Ask "what is the next best career move for me?" — ranked for your stage'),
        bullet('Ask "how do I get placed or find an internship?" — checklist, tests and portals'),
        bullet('Open the Explore tab for routes, the Guide tab for everything else'),
        '',
        'Try: "Which is better, a diploma or B.Tech in computer science?"',
      ].join('\n'),
      source: 'brain-cache:greeting',
      usedLinks: [],
    };
  }

  if (
    q.includes('what can you do') || q.includes('what can u do') || q.includes('how can you help') ||
    q.includes('how do you help') || q.includes('your features') || q.includes('what do you do') ||
    (q.includes('help') && q.length < 30 && !/decide|choose|select|confus/.test(q)) || q.includes('who are you') || q.includes('about yourself') ||
    q.includes('introduce yourself')
  ) {
    return {
      reply: [
        '🤖 **Here is what I can do for you:**',
        '',
        bullet('**Compare routes** — "PCM vs diploma", "ITI vs polytechnic", with fees and time to first salary'),
        bullet('**Explain exams** — JEE, NEET, CUET, GATE, CAT, SSC CGL and 30+ more, with official portals'),
        bullet('**Find money** — scholarships and fee waivers your family can actually apply for'),
        bullet('**Show jobs** — government and private careers with real starting pay bands'),
        bullet('**Get you placed** — readiness checklists, hiring tests, internships and apprenticeships for your stage'),
        bullet('**Plan skills** — what to learn this month, with a first project to build'),
        '',
        'Ask me anything — for example "Can I do B.Tech without JEE?"',
      ].join('\n'),
      source: 'brain-cache:capabilities',
      usedLinks: [],
    };
  }

  if (/thank|thx|dhanyavad|shukriya|bahut (accha|badia)|great answer|awesome|nice (answer|work)|well done|good (job|answer|bot)/.test(q)) {
    return {
      reply: [
        `😊 **You are most welcome${saidName}!**`,
        '',
        'All the best with your studies. One small tip: finish one chapter or one project milestone today — consistency beats intensity.',
        '',
        'Ask me anything else — exams, fees, jobs, scholarships — I am right here.',
      ].join('\n'),
      source: 'brain-cache:thanks',
      usedLinks: [],
    };
  }

  if (/^(bye|goodbye|good night|see you|alvida|phir milenge|ok bye|okay bye)[!.\s]*$/.test(trimmed)) {
    return {
      reply: [
        `👋 **Phir milenge${saidName}! Good luck with your preparation.**`,
        '',
        'Your profile and roadmap checklist are saved — come back anytime and we will continue where you left off.',
      ].join('\n'),
      source: 'brain-cache:goodbye',
      usedLinks: [],
    };
  }

  if (q.includes('love this') || q.includes('best app') || q.includes('very helpful') || q.includes('really helpful')) {
    return {
      reply: [
        `💛 **That means a lot${saidName} — thank you!**`,
        '',
        'If it helped you, share PathMitra with one friend who is also confused about streams. And keep asking — the more specific your question, the better my answer.',
      ].join('\n'),
      source: 'brain-cache:feedback',
      usedLinks: [],
    };
  }

  // --------------------------------------------------------------------------
  // Quick messages students actually type between real questions. Answering
  // these locally keeps short, low-value turns away from the AI providers.
  // --------------------------------------------------------------------------

  if (/^(ok|okay|okey|k|hmm+|hmmm+|haan|han|yes|yeah|yep|ya|no|nope|nah|nahi|thik hai|theek hai|achha|acha|got it|alright|fine|sure|cool|nice|good)[!.\s]*$/.test(trimmed)) {
    return {
      reply: [
        '👍 **Noted — ask me whenever you are ready. No question is too small here.**',
        '',
        bullet('Not sure where to start? Ask **"what can I do after Class 10?"**'),
        bullet('Worried about money? Ask **"how much does a diploma cost?"**'),
        bullet('Want a plan in order? Ask **"what should I do next?"**'),
      ].join('\n'),
      source: 'brain-cache:quick-ack',
      usedLinks: [],
    };
  }

  if (/confus|don'?t know what to do|dont know what to do|no idea what to do|samajh nahi|samjha nahi|kya karu|kya karun|what should i choose|help me (decide|choose|select)|mind is blank|stressed|tension/.test(q)) {
    const whereNow = profile.qualification
      ? `From ${profile.qualification}, the realistic next steps are listed in your Roadmap tab. Ask me **"what should I do next?"** and I will walk through them one by one.`
      : 'Tell me your stage — **"I am in Class 10"**, **"I finished 12th Science"**, **"I am doing a diploma"** — and the whole plan becomes specific instead of general.';
    return {
      reply: [
        '🤝 **Take a breath. Being confused at this stage is normal, and it is fixable.**',
        '',
        whereNow,
        '',
        'Answer these three honestly for yourself:',
        bullet('Which two subjects can you study for an hour without getting bored?'),
        bullet('How much can your family spend per year without taking a loan?'),
        bullet('Do you want to earn soon, or study longer for a higher-paying job?'),
        '',
        'Those three answers cut 18 pathways down to two or three. Tell me your answers and I will compare them side by side.',
      ].join('\n'),
      source: 'brain-cache:decision-help',
      usedLinks: [],
    };
  }

  if (/are you (a )?(real|human|person|bot|robot|ai)|who (made|built|created) you|are you chatgpt|which (ai|model) are you|are you free/.test(q)) {
    return {
      reply: [
        '🤖 **I am PathMitra — the guidance assistant inside this app, built for students from Class 10 through Class 12, diploma, ITI, medical, engineering, degree and postgraduation.**',
        '',
        bullet('I answer first from this app\'s own datasets: pathways, exams, careers, scholarships, skills and state-wise rules'),
        bullet('If a question goes beyond that data, an external model is used only as a helper — the numbers and portals you see still come from the datasets'),
        bullet('I am free to use, and I am not an official admissions or recruitment authority. Confirm dates, fees and eligibility on the linked portal'),
      ].join('\n'),
      source: 'brain-cache:identity',
      usedLinks: [],
    };
  }

  return null;
}

// ----------------------------------------------------------------------------
// Virtual compare targets: real degrees students ask about that are NOT their
// own pathway entry (B.Tech, MBBS, CA). Each carries the honest numbers for a
// fair side-by-side and ends in real guidance, never a bare exam card.
// ----------------------------------------------------------------------------

interface VirtualTarget {
  id: string;
  label: string;
  aliases: string[];
  duration: string;
  entry: string;
  govtCost: string;
  privateCost: string;
  strength: string;
  watchOut: string;
  verdict: string;
  links: Link[];
}

const VIRTUAL_TARGETS: VirtualTarget[] = [
  {
    id: 'btech',
    label: 'B.Tech / B.E. (4-year engineering degree)',
    aliases: ['b.tech', 'btech', 'b tech', 'engineering degree', 'computer science engineering', 'cse degree', 'b.e.', 'be degree'],
    duration: '4 years after Class 12 (or 3 years via diploma lateral entry)',
    entry: 'Class 12 PCM + JEE Main / state CET, OR 3-year diploma + lateral entry test (no JEE needed)',
    govtCost: '₹15,000 – ₹1.5 lakh per year (NITs / state govt colleges)',
    privateCost: '₹1 – ₹3.5 lakh per year (private colleges; top private higher)',
    strength: 'widest-recognised engineering degree; unlocks GATE, PSUs, IT placements, MS abroad',
    watchOut: 'heaviest total cost and 6 years Class 10 → B.Tech; college quality decides placements',
    verdict: 'B.Tech first if the family can fund 4 years and the student enjoys Maths — it keeps PSU, GATE and top IT doors open',
    links: [
      { label: 'JEE Main official portal (NTA)', url: 'https://jeemain.nta.nic.in' },
      { label: 'AICTE (approval & lateral entry norms)', url: 'https://www.aicte-india.org' },
    ],
  },
  {
    id: 'mbbs',
    label: 'MBBS (5.5-year medical degree)',
    aliases: ['mbbs', 'medical degree', 'doctor course', 'mbbs degree'],
    duration: '5.5 years (4.5 + 1-year internship)',
    entry: 'Class 12 PCB + NEET-UG rank; no lateral entry route',
    govtCost: '₹10,000 – ₹1 lakh per year (govt medical college)',
    privateCost: '₹8 – ₹25 lakh per year (private / deemed)',
    strength: 'most respected, most secure career in India; government doctor posts in every district',
    watchOut: 'needs Biology + very high NEET rank; longest route to first full salary (age 24+)',
    verdict: 'MBBS first only with PCB in Class 12 and genuine interest in medicine — it is the longest and most competitive route',
    links: [{ label: 'NEET-UG official portal (NTA)', url: 'https://neet.nta.nic.in' }],
  },
  {
    id: 'ca',
    label: 'CA — Chartered Accountancy',
    aliases: ['ca ', 'chartered account', ' ca', 'c.a.', 'ca foundation', 'accountancy'],
    duration: '4.5–5 years alongside/after Class 12 (Foundation → Inter → Final + articleship)',
    entry: 'Class 12 any stream + CA Foundation (ICAI); no JEE/NEET needed',
    govtCost: 'ICAI fees are modest (tens of thousands total), coaching extra',
    privateCost: 'coaching ₹30,000 – ₹1 lakh+ per level in private institutes',
    strength: 'highest-paid commerce career; every company needs CAs; practice or corporate both open',
    watchOut: 'pass percentages are low at Final level; articleship years pay a small stipend',
    verdict: 'CA first for commerce students who enjoy accounts and can sustain 4–5 years of exam grind',
    links: [{ label: 'ICAI (CA official body)', url: 'https://www.icai.org' }],
  },
];

function findAllVirtualTargets(q: string): VirtualTarget[] {
  const hits: Array<{ target: VirtualTarget; pos: number }> = [];
  for (const target of VIRTUAL_TARGETS) {
    for (const alias of target.aliases) {
      // Aliases are trimmed and matched on word boundaries, otherwise a raw
      // substring like " ca" would match inside ordinary words ("can i do")
      // and hijack completely unrelated questions.
      const key = alias.trim();
      if (key.length < 2 || !aliasHit(q, key)) continue;
      const idx = q.indexOf(key);
      if (idx >= 0) {
        hits.push({ target, pos: idx });
        break;
      }
    }
  }
  hits.sort((x, y) => x.pos - y.pos);
  const seen = new Set<string>();
  const ordered: VirtualTarget[] = [];
  for (const h of hits) {
    if (!seen.has(h.target.id)) {
      seen.add(h.target.id);
      ordered.push(h.target);
    }
  }
  return ordered;
}

// Short aliases (pcm, iti, ca) match on word boundaries only, so "position"
// never triggers ITI and "science" never triggers a stray short code.
function aliasHit(q: string, alias: string): boolean {
  if (alias.length > 4) return q.includes(alias);
  return new RegExp(`\\b${escapeRegExp(alias)}\\b`).test(q);
}

function findPathwaysInQuery(q: string): string[] {
  const found: Array<{ id: string; pos: number }> = [];
  for (const p of PATHWAYS) {
    let pos = -1;
    const names = [p.name.toLowerCase(), p.shortName.toLowerCase()];
    for (const name of names) {
      if (name.length < 3) continue;
      const idx = q.indexOf(name);
      if (idx >= 0 && (pos < 0 || idx < pos)) pos = idx;
    }
    // Keys must match real PathwayId values. Degree targets students ask about
    // (B.Tech, MBBS, CA) are NOT pathways — they live in VIRTUAL_TARGETS and
    // are paired with pathways by comparisonAnswer, never by this map.
    const extra: Record<string, string[]> = {
      polytechnic: ['diploma', 'diploma in computer', 'poly'],
      'science-pcm': ['pcm'],
      'science-pcb': ['pcb'],
      'commerce-ip': ['commerce', 'b.com', 'bcom'],
      'arts-humanities': ['arts stream', 'humanities'],
      iti: ['iti'],
      bca: ['bca', 'computer applications'],
      paramedical: ['nursing', 'paramedical', 'gnm', 'anm'],
    };
    for (const alias of extra[p.id] ?? []) {
      if (aliasHit(q, alias) && (pos < 0 || q.indexOf(alias) < pos)) pos = q.indexOf(alias);
    }
    if (pos >= 0) found.push({ id: p.id, pos });
  }
  return found.sort((a, b) => a.pos - b.pos).map((f) => f.id);
}

// Exam names mentioned in a question, in the order the student wrote them.
// Long names match as substrings; short codes (NDA, NCET) only on word
// boundaries so "agenda" never triggers NDA.
function findExamsInQuery(q: string): string[] {
  const found: Array<{ id: string; pos: number }> = [];
  for (const exam of EXAMS) {
    const candidates = [exam.name.toLowerCase().split('(')[0].trim(), exam.shortName.toLowerCase()];
    let pos = -1;
    for (const candidate of candidates) {
      if (candidate.length < 3 || !aliasHit(q, candidate)) continue;
      const idx = q.indexOf(candidate);
      if (idx >= 0 && (pos < 0 || idx < pos)) pos = idx;
    }
    if (pos >= 0) found.push({ id: exam.id, pos });
  }
  return found.sort((a, b) => a.pos - b.pos).map((f) => f.id);
}

function comparisonAnswer(q: string, profile: StudentProfile): LocalAnswer | null {
  const wantsCompare =
    q.includes(' vs ') || q.includes(' vs.') || q.includes(' v/s ') || q.includes('versus') ||
    q.includes('which is better') || q.includes('which one is better') ||
    q.includes('compare') || q.includes('comparison') || q.includes('difference between') || q.includes('diff between') ||
    (q.includes(' or ') && (q.includes('better') || q.includes('choose') || q.includes('should i') || q.includes('suggest') || q.includes('recommend')));
  if (!wantsCompare) return null;

  const ids = [...new Set(findPathwaysInQuery(q))];
  const virtuals = findAllVirtualTargets(q);

  // Two real pathways, e.g. "polytechnic vs ITI".
  if (ids.length >= 2) return pathwayVsPathway(ids[0], ids[1], profile);
  // One pathway + one degree target — the most common question in the app,
  // e.g. "diploma in computer science or b tech in computer science?".
  if (ids.length === 1 && virtuals.length >= 1) return mixedComparisonAnswer(ids[0], virtuals[0], q, profile);
  // Two degree targets, e.g. "B.Tech or MBBS — which is better?".
  if (ids.length === 0 && virtuals.length >= 2) return virtualVsVirtual(virtuals[0], virtuals[1], profile);
  // Two entrance tests, e.g. "JEE Main vs WBJEE — which should I prepare for?".
  if (ids.length === 0 && virtuals.length === 0) {
    const examIds = findExamsInQuery(q);
    if (examIds.length >= 2) return examVsExam(examIds[0], examIds[1]);
  }
  return null;
}

function pathwayVsPathway(aId: string, bId: string, profile: StudentProfile): LocalAnswer | null {
  const a = PATHWAYS.find((p) => p.id === aId);
  const b = PATHWAYS.find((p) => p.id === bId);
  if (!a || !b) return null;

  const firstName = profile.name ? profile.name.split(' ')[0] : '';
  const reply = [
    `⚖️ **${a.name} vs ${b.name} — honest side-by-side**`,
    '',
    `- **Duration:** ${a.durationLabel} vs ${b.durationLabel}`,
    `- **Entry after:** ${a.eligibility} vs ${b.eligibility}`,
    `- **Government cost:** ${a.cost.government} vs ${b.cost.government}`,
    `- **Private cost:** ${a.cost.private} vs ${b.cost.private}`,
    `- **${a.name} strength:** ${a.pros[0]}`,
    `- **${b.name} strength:** ${b.pros[0]}`,
    `- **${a.name} watch-out:** ${a.cons[0]}`,
    `- **${b.name} watch-out:** ${b.cons[0]}`,
    '',
    `**My take${firstName ? ` for ${firstName}` : ''}:** pick **${a.name}** if ${a.bestFor.toLowerCase()}; pick **${b.name}** if ${b.bestFor.toLowerCase()}. Compare the full table on the Compare tab before deciding.`,
    '',
    profileSummary(profile) ? `Your profile so far: ${profileSummary(profile)}` : '',
    linkBlock([...a.links, ...b.links]),
  ].filter(Boolean).join('\n');
  return {
    reply,
    source: 'brain-cache:comparison',
    usedLinks: [...a.links, ...b.links].map((l) => l.url),
  };
}

// Pathway vs degree target, e.g. Polytechnic Diploma vs B.Tech. This is the
// comparison students ask about most, so it carries branch-specific guidance
// (computer science questions get a CS verdict) and the lateral-entry bridge.
function mixedComparisonAnswer(
  pathwayId: string,
  v: VirtualTarget,
  q: string,
  profile: StudentProfile,
): LocalAnswer | null {
  const p = PATHWAYS.find((x) => x.id === pathwayId);
  if (!p) return null;
  const firstName = profile.name ? profile.name.split(' ')[0] : '';
  const lines = [
    `⚖️ **${p.shortName} vs ${v.label} — honest side-by-side**`,
    '',
    `- **Duration:** ${p.durationLabel} vs ${v.duration}`,
    `- **Entry after:** ${p.eligibility} vs ${v.entry}`,
    `- **Government cost:** ${p.cost.government} vs ${v.govtCost}`,
    `- **Private cost:** ${p.cost.private} vs ${v.privateCost}`,
    `- **${p.shortName} strength:** ${p.pros[0]}`,
    `- **${v.label} strength:** ${v.strength}`,
    `- **${p.shortName} watch-out:** ${p.cons[0]}`,
    `- **${v.label} watch-out:** ${v.watchOut}`,
  ];
  if (pathwayId === 'polytechnic' && v.id === 'btech') {
    if (/(computer|cse|software|information technology)/.test(q)) {
      lines.push(
        '',
        '- **For computer science specifically:** a CSE diploma puts you in coding labs from year one with a technician or junior-dev income by about age 19; B.Tech CSE costs more years and money but unlocks product-company placements, GATE/PSU seats and MS abroad, which all require a degree.',
      );
    }
    lines.push(
      '',
      '- **Middle path many students take:** 3-year diploma, then lateral entry straight into B.Tech 2nd year through the state test (for example JELET in West Bengal) — no JEE Main needed, and you save a full year.',
    );
  }
  lines.push(
    '',
    `**My take${firstName ? ` for ${firstName}` : ''}:** ${v.verdict}; choose **${p.name}** if ${p.bestFor.toLowerCase()}.`,
    '',
    profileSummary(profile) ? `Your profile so far: ${profileSummary(profile)}` : '',
    linkBlock([...p.links, ...v.links]),
  );
  return {
    reply: lines.filter(Boolean).join('\n'),
    source: 'brain-cache:comparison',
    usedLinks: [...p.links, ...v.links].map((l) => l.url),
  };
}

function virtualVsVirtual(a: VirtualTarget, b: VirtualTarget, profile: StudentProfile): LocalAnswer {
  const firstName = profile.name ? profile.name.split(' ')[0] : '';
  const reply = [
    `⚖️ **${a.label} vs ${b.label} — honest side-by-side**`,
    '',
    `- **Duration:** ${a.duration} vs ${b.duration}`,
    `- **Entry:** ${a.entry} vs ${b.entry}`,
    `- **Government cost:** ${a.govtCost} vs ${b.govtCost}`,
    `- **Private cost:** ${a.privateCost} vs ${b.privateCost}`,
    `- **${a.label} strength:** ${a.strength}`,
    `- **${b.label} strength:** ${b.strength}`,
    `- **Watch-outs:** ${a.watchOut}; meanwhile ${b.watchOut.charAt(0).toLowerCase() + b.watchOut.slice(1)}`,
    '',
    `**My take${firstName ? ` for ${firstName}` : ''}:** ${a.verdict}; on the other side, ${b.verdict.charAt(0).toLowerCase() + b.verdict.slice(1)}.`,
    '',
    profileSummary(profile) ? `Your profile so far: ${profileSummary(profile)}` : '',
    linkBlock([...a.links, ...b.links]),
  ].filter(Boolean).join('\n');
  return {
    reply,
    source: 'brain-cache:comparison',
    usedLinks: [...a.links, ...b.links].map((l) => l.url),
  };
}

function examVsExam(aId: string, bId: string): LocalAnswer | null {
  const a = EXAMS.find((e) => e.id === aId);
  const b = EXAMS.find((e) => e.id === bId);
  if (!a || !b) return null;
  const reply = [
    `⚖️ **${a.shortName} vs ${b.shortName} — they serve different goals**`,
    '',
    `- **Conducted by:** ${a.conductedBy} vs ${b.conductedBy}`,
    `- **Who can apply:** ${a.eligibility} vs ${b.eligibility}`,
    `- **What it gives:** ${a.grants} vs ${b.grants}`,
    `- **Typical cycle:** ${a.cycleWindow} vs ${b.cycleWindow}`,
    `- **Prep effort:** roughly ${a.prepMonths} months vs roughly ${b.prepMonths} months`,
    '',
    `**My take:** prepare for **${a.shortName}** if ${a.grants.charAt(0).toLowerCase() + a.grants.slice(1)} is your goal; prepare for **${b.shortName}** if ${b.grants.charAt(0).toLowerCase() + b.grants.slice(1)} is. Confirm this year's dates on the official portals before applying.`,
    linkBlock([
      { label: `${a.shortName} official portal`, url: a.officialUrl },
      { label: `${b.shortName} official portal`, url: b.officialUrl },
    ]),
  ].join('\n');
  return { reply, source: 'brain-cache:comparison', usedLinks: [a.officialUrl, b.officialUrl] };
}

// ----------------------------------------------------------------------------
// Extended grounded knowledge.
// Every answer below is assembled from the app's own datasets (pathways, exams,
// careers, scholarships, skills, states, roi scenarios), so the advisor covers
// the questions students ask most without spending an API call. Questions that
// genuinely need live or external facts are still left to the AI providers.
// ----------------------------------------------------------------------------

const QUALIFICATION_LABELS: Record<QualificationId, string> = {
  class10: 'Class 10',
  class11: 'Class 11',
  'class12-science': 'Class 12 Science',
  'class12-commerce': 'Class 12 Commerce',
  'class12-arts': 'Class 12 Arts',
  diploma: 'a polytechnic diploma',
  iti: 'an ITI trade certificate',
  'btech-student': 'a B.Tech / B.E. course',
  'medical-student': 'a medical or healthcare course (MBBS, nursing, paramedical)',
  'b-ed-student': 'a B.Ed course',
  undergraduate: 'an undergraduate degree course',
  graduate: 'a completed degree',
  postgraduate: 'a postgraduate degree',
};

const COST_INTENT =
  /(fee|fees|cost|charge|expense|expenditure|budget|afford|expensive|cheap|cheapest|karcha|kharcha|paise|paisa|money|loan|emi|free)/;

const SALARY_INTENT =
  /(salary|salaries|pay|package|ctc|lpa|stipend|income|earning|kamai|kitna milega|how much (will|do|can) i earn)/;

const GOVT_JOB_INTENT =
  /(govt|government|sarkari|sarkar|psu|railway|bank|police|defence|army|navy|air ?force|teaching job|teacher job|clerk|constable|stable job)/;

const TIME_INTENT =
  /(how many years|how long|how much time|kitne saal|kitna time|duration|kab tak|till what age|how old|too late|late ho|time lag|years will it take)/;

const DOCUMENT_INTENT =
  /(document|documents|paper|papers|kagaz|certificate chahiye|proof chahiye|what is needed to apply)/;

const DEADLINE_INTENT =
  /(deadline|last date|apply kab|application (date|window|period)|kab tak apply|when to apply|last date kya)/;

function profileStageLabel(profile: StudentProfile): string {
  if (!profile.qualification) return '';
  return QUALIFICATION_LABELS[profile.qualification as QualificationId] ?? profile.qualification;
}

/** Pathways this stage can enter next, ranked by how well they match interests. */
function eligiblePathways(profile: StudentProfile) {
  const stage = profile.qualification as QualificationId;
  const eligible = PATHWAYS.filter((p) => p.startsAfter.includes(stage));
  return [...eligible].sort((a, b) => {
    const aHits = a.fits.filter((f) => profile.interests.includes(f)).length;
    const bHits = b.fits.filter((f) => profile.interests.includes(f)).length;
    return bHits - aHits;
  });
}

function mentionPathways(profile: StudentProfile, limit = 3) {
  if (!profile.qualification) return [];
  return eligiblePathways(profile).slice(0, limit);
}

/** Pathways explicitly named in the question. */
function targetedPathways(q: string) {
  const ids = [...new Set(findPathwaysInQuery(q))];
  return ids
    .map((id) => PATHWAYS.find((p) => p.id === id))
    .filter((p): p is (typeof PATHWAYS)[number] => Boolean(p));
}

function stageOptionsOf(stage: QualificationId | undefined) {
  const info = stage ? QUALIFICATIONS.find((x) => x.id === stage) : undefined;
  if (!info) return [];
  return info.canChoose
    .map((id) => PATHWAYS.find((p) => p.id === id))
    .filter((p): p is (typeof PATHWAYS)[number] => Boolean(p));
}

function rankForInterests(pathways: ReturnType<typeof stageOptionsOf>, profile: StudentProfile) {
  return [...pathways].sort((a, b) => {
    const aHits = a.fits.filter((f) => profile.interests.includes(f)).length;
    const bHits = b.fits.filter((f) => profile.interests.includes(f)).length;
    return bHits - aHits;
  });
}

/** Explicit "after X" phrases, so we only switch stage when the student says so. */
const STAGE_PHRASES: Array<{ id: QualificationId; test: RegExp }> = [
  { id: 'class10', test: /(after|post|passed|complete(d)?|finish(ed)?|ke baad|k baad)\s*(my\s*)?(class\s*10|10th|ten|madhyamik|matric|high school)/ },
  { id: 'class11', test: /(after|post|passed|complete(d)?|finish(ed)?|ke baad|k baad)\s*(my\s*)?(class\s*11|11th|eleventh)\b/ },
  { id: 'class12-science', test: /(after|post|passed|complete(d)?|finish(ed)?|ke baad|k baad)\s*(my\s*)?(class\s*12|12th|twelfth|intermediate|higher secondary|hsc)/ },
  { id: 'btech-student', test: /(after|post|completed?)\s*(my\s*)?(b\.?\s?tech|b\.?e\b|engineering)/ },
  { id: 'medical-student', test: /(after|post|complet(ed|ing)?)\s*(my\s*)?(mbbs|bams|bhms|bds|b\.?sc\s*nursing|nursing|paramedical)\b/ },
  { id: 'diploma', test: /(after|post|completed?)\s*((my|a|the)\s*)*(diploma|polytechnic)/ },
  { id: 'iti', test: /(after|post|completed?)\s*((my|an?|the)\s*)*(iti|trade certificate)/ },
  { id: 'postgraduate', test: /(after|post|completed?)\s*(my\s*)?(masters?|m\.?tech|m\.?sc|m\.?com|m\.?a\b|post\s?graduation|pg)\b/ },
  { id: 'graduate', test: /(after|post|completed?)\s*((my|a|the)\s*)*(graduation|graduating|degree|b\.?com|b\.?sc|bca|b\.?a)\b/ },
  { id: 'undergraduate', test: /(doing|in|pursuing|studying)\s*(my\s*)?(bca|b\.?sc|b\.?com|b\.?a)\b/ },
];

/** The pathway a student is finishing when they ask "what after X". */
const STAGE_PATHWAY: Partial<Record<QualificationId, string>> = {
  diploma: 'polytechnic',
  iti: 'iti',
  'btech-student': 'engineering',
  graduate: 'general-degree',
  postgraduate: 'm-sc',
};

function detectStagePhrase(q: string, profile: StudentProfile): QualificationId | undefined {
  for (const phrase of STAGE_PHRASES) {
    if (!phrase.test.test(q)) continue;
    if (phrase.id === 'class12-science') {
      const known = profile.qualification;
      const isClass12 = known === 'class12-science' || known === 'class12-commerce' || known === 'class12-arts';
      return isClass12 ? known : 'class12-science';
    }
    return phrase.id;
  }
  return undefined;
}

/** "How much will it cost?" — grounded in pathway cost bands and roi scenarios. */
function costAnswer(q: string, profile: StudentProfile): LocalAnswer | null {
  if (!COST_INTENT.test(q)) return null;

  // "Can we afford this at all?" and fee-waiver questions are really
  // scholarship questions, so answer them from the scholarship dataset.
  const affordIntent =
    /(waiver|freeship|free education|study free|can'?t afford|cannot afford|not afford|too expensive|poor family|poor student|family income|garib|kam paisa|no money)/.test(q);
  if (affordIntent && targetedPathways(q).length === 0 && findAllVirtualTargets(q).length === 0) {
    return scholarshipAnswer(profile);
  }

  const targets = targetedPathways(q).slice(0, 2);
  if (targets.length > 0) {
    const lines: string[] = ['💰 **What this route actually costs**', ''];
    for (const p of targets) {
      lines.push(
        `**${p.emoji} ${p.name}**`,
        bullet(`Government institute: ${p.cost.government}`),
        bullet(`Private institute: ${p.cost.private}`),
        bullet(`Duration: ${p.durationLabel}`),
        bullet(`Real strength: ${p.pros[0]}`),
        bullet(`Honest watch-out: ${p.cons[0]}`),
        '',
      );
    }
    lines.push(
      '**Three ways families cut this cost**',
      bullet('Government institutes plus state fee reimbursement — the single biggest saving'),
      bullet('Scholarships: NSP post-matric, state schemes, AICTE Pragati for girl students, INSPIRE for science'),
      bullet('Earning while studying — apprenticeship stipend, part-time work, or lateral entry after a diploma'),
      '',
      'Ask me "which scholarships can my family get?" and I will match schemes to your stage.',
      linkBlock(targets.flatMap((p) => p.links)),
    );
    return {
      reply: lines.join('\n'),
      source: 'brain-cache:cost',
      usedLinks: targets.flatMap((p) => p.links.map((l) => l.url)),
    };
  }

  const virtuals = findAllVirtualTargets(q).slice(0, 2);
  if (virtuals.length > 0) {
    const lines: string[] = ['💰 **What this degree costs in India**', ''];
    for (const v of virtuals) {
      lines.push(
        `**${v.label}**`,
        bullet(`Government: ${v.govtCost}`),
        bullet(`Private: ${v.privateCost}`),
        bullet(`Duration: ${v.duration}`),
        '',
      );
    }
    lines.push(
      'The government-versus-private gap is the whole story here: a government seat can cost less in total than a single private year.',
      linkBlock(virtuals.flatMap((v) => v.links)),
    );
    return {
      reply: lines.join('\n'),
      source: 'brain-cache:cost',
      usedLinks: virtuals.flatMap((v) => v.links.map((l) => l.url)),
    };
  }

  const lines = [
    '💰 **Total cost from Class 10 to the first salary**',
    '',
    ...SCENARIOS.map((s) =>
      bullet(
        `**${s.emoji} ${s.title}** — ${formatINR(s.costLow)} to ${formatINR(s.costHigh)} over about ${s.totalYears} years; first income around age ${s.firstEarningAge}`,
      ),
    ),
    '',
    '**The cheapest real routes**',
    bullet('ITI trade then apprenticeship — shortest time to income, lowest total cost'),
    bullet('Government polytechnic diploma — low fees, and lateral entry into B.Tech 2nd year saves a full year'),
    bullet('Government general degree or CA — low fees, and you can start earning alongside'),
    '',
    profileStageLabel(profile)
      ? `At your stage (${profileStageLabel(profile)}), start from the government option of whichever route you like.`
      : 'Tell me your stage and I will price only the routes that actually apply to you.',
    'Cost is only half the picture — a cheap course with no local hiring costs more in the end. Ask me "which route pays the best?" to compare outcomes.',
    linkBlock(OPPORTUNITIES.filter((o) => o.type === 'apprenticeship').slice(0, 2).map((o) => o.portal)),
  ];
  return { reply: lines.join('\n'), source: 'brain-cache:cost-overview', usedLinks: [] };
}

/** "Which government jobs can I aim for?" — filtered from the careers dataset. */
function govtJobAnswer(q: string, profile: StudentProfile): LocalAnswer | null {
  if (!GOVT_JOB_INTENT.test(q)) return null;
  if (!/(job|jobs|naukri|career|service|post|vacancy|recruit|salary|pay|line|option|scope|banna|ban sakta)/.test(q)) return null;

  const stage = profile.qualification as QualificationId | '';
  const govtJobs = careersForStage(profile.qualification).filter(
    (c) => c.sector === 'govt' || c.sector === 'both',
  );
  const forStage = stage ? govtJobs.filter((c) => isCareerCloseMatch(c, profile.qualification)) : [];
  const picks = (forStage.length >= 2 ? forStage : govtJobs).slice(0, 4);

  const lines = [
    '🏛️ **Government jobs you can realistically aim for**',
    '',
    ...picks.map((c) =>
      bullet(
        `**${c.emoji} ${c.title}** — minimum: ${c.minimumQualification}; starts around ${c.startingBand}; after 5–8 years ${c.experiencedBand}`,
      ),
    ),
    '',
    stage
      ? `Mirrored against your profile (${profileStageLabel(profile)}), these are the nearest entry points.`
      : 'Tell me your stage — "I am in Class 10" or "I finished 12th" — and I will narrow this to the exams you can attempt next.',
    '',
    '**Two honest notes for parents**',
    bullet('Every government post needs the notified qualification at the time of application — a diploma or degree cannot be skipped.'),
    bullet('Selection is exam-based and competitive, so keep one government track alongside one employable skill.'),
    '',
    'Ask me about any one of these, or "how do I prepare for a railway job?" for the exact route.',
    linkBlock(
      SKILL_TRACKS.filter((t) => t.id === 'govt-exam-prep').flatMap((t) => t.resources),
    ),
  ];
  return {
    reply: lines.join('\n'),
    source: 'brain-cache:govt-jobs',
    usedLinks: SKILL_TRACKS.filter((t) => t.id === 'govt-exam-prep').flatMap((t) => t.resources.map((r) => r.url)),
  };
}

/** "How much will I earn?" — pay bands straight from the careers dataset. */
function salaryAnswer(q: string, profile: StudentProfile): LocalAnswer | null {
  if (!SALARY_INTENT.test(q)) return null;

  const titled = CAREERS.filter((c) =>
    c.title.toLowerCase().split(/\s+/).some((word) => word.length > 4 && q.includes(word)),
  );
  const picks = (
    titled.length > 0
      ? titled
      : CAREERS.filter((c) => c.demandOutlook === 'very high' || c.demandOutlook === 'high')
  ).slice(0, 4);

  const lines = [
    '💵 **Realistic pay bands in India right now**',
    '',
    ...picks.map((c) =>
      bullet(
        `**${c.title}** — starting ${c.startingBand}; after 5–8 years ${c.experiencedBand} (demand: ${c.demandOutlook})`,
      ),
    ),
    '',
    '**How to read these numbers**',
    bullet('Starting pay depends far more on the employer than on the degree name.'),
    bullet('In IT and design, a portfolio of real projects moves you up a band faster than a certificate does.'),
    bullet('Government pay looks lower at the start but includes job security and predictable increments.'),
    '',
    profileSummary(profile) ? `Your profile so far: ${profileSummary(profile)}` : '',
    'Ask me "what skills should I learn to reach the higher band?" for the fastest lever.',
  ];
  return { reply: lines.filter(Boolean).join('\n'), source: 'brain-cache:salary', usedLinks: [] };
}

/** "How many years will this take?" — duration, first salary age and payback. */
function timeAnswer(q: string, profile: StudentProfile): LocalAnswer | null {
  if (!TIME_INTENT.test(q)) return null;

  const targets = targetedPathways(q).slice(0, 2);
  if (targets.length > 0) {
    const lines: string[] = ['⏳ **How long this takes, honestly**', ''];
    for (const p of targets) {
      lines.push(
        `**${p.emoji} ${p.name}**`,
        bullet(`Course duration: ${p.durationLabel}`),
        bullet(`Entry requirement: ${p.eligibility}`),
        bullet(`Time in study after starting: about ${p.durationYears} years`),
        bullet(`What comes next: ${p.nextSteps[0]}`),
        '',
      );
    }
    lines.push(
      'Add the years you have already spent to that duration — that gives the honest age at first salary.',
      linkBlock(targets.flatMap((p) => p.links)),
    );
    return {
      reply: lines.join('\n'),
      source: 'brain-cache:duration',
      usedLinks: targets.flatMap((p) => p.links.map((l) => l.url)),
    };
  }

  const virtuals = findAllVirtualTargets(q).slice(0, 2);
  if (virtuals.length > 0) {
    const lines: string[] = ['⏳ **How long this degree takes**', ''];
    for (const v of virtuals) {
      lines.push(`**${v.label}**`, bullet(`Duration: ${v.duration}`), bullet(`Entry: ${v.entry}`), '');
    }
    lines.push('The longer the course, the more the delay before any income — weigh that against the pay band you are aiming for.');
    return { reply: lines.join('\n'), source: 'brain-cache:duration', usedLinks: [] };
  }

  const lines = [
    '⏳ **Time from Class 10 to the first salary**',
    '',
    ...SCENARIOS.map((s) =>
      bullet(
        `**${s.title}** — about ${s.totalYears} years in total; first real income around age ${s.firstEarningAge}; roughly ${studyYearsBeforeIncome(s)} study years before income`,
      ),
    ),
    '',
    '**The trade-off nobody says out loud**',
    bullet('Every extra study year is a year of fees plus a year of salary not earned.'),
    bullet(paybackNote(findScenario('diploma-lateral') ?? SCENARIOS[0])),
    '',
    profile.qualification
      ? `At your stage (${profileStageLabel(profile)}), the diploma-to-B.Tech and ITI routes are usually the shortest honest path to a first salary — ask me "how long does a diploma take?" for that exact route.`
      : 'If you have already lost a year, ask me "is it too late for me to start?" — for most routes the honest answer is no.',
  ];
  return { reply: lines.join('\n'), source: 'brain-cache:duration-overview', usedLinks: [] };
}

/** "Will my parents agree?" — the family-alignment questions. */
function parentAnswer(q: string, profile: StudentProfile): LocalAnswer | null {
  const wants =
    /(parent|parents|papa|pappa|mummy|mom|dad|father|mother|family|ghar walo|ghar walon|will they (agree|accept|allow)|log kya kahenge|respect|izzat|samman|society)/.test(
      q,
    );
  if (!wants) return null;

  const options = mentionPathways(profile, 2);
  const trusted = CAREERS.filter((c) => c.sector === 'govt').slice(0, 3);

  const lines: string[] = [
    '👨‍👩‍👦 **Talking to your family about this — what actually works**',
    '',
    'Parents usually object to three things: money, uncertainty and what relatives will say. Answer each of them with numbers, not adjectives.',
    bullet('**Money:** show the government-institute fee and the scholarships you qualify for — never the private-college fee.'),
    bullet('**Uncertainty:** show the job list and pay bands for the route, with real vacancies rather than hope.'),
    bullet('**Respect:** show that a government or licensed profession stays open from this route.'),
    '',
  ];

  if (options.length > 0) {
    lines.push(`**For your stage (${profileStageLabel(profile)}), the routes worth presenting**`);
    for (const p of options) {
      lines.push(
        bullet(`**${p.name}** — ${p.durationLabel}; government cost ${p.cost.government}; be upfront about this: ${p.cons[0]}`),
      );
    }
    lines.push('');
  }

  lines.push(
    '**Jobs that carry the most family confidence**',
    ...trusted.map((c) => bullet(`**${c.title}** — ${c.parentNote}`)),
    '',
    'Practical tip: bring one printed page. Route, total fee, exam name, official portal. A page beats an argument.',
    '',
    profile.priorities.includes('respect-family')
      ? 'You marked family respect as a priority, so weigh the government and licensed routes higher when you choose.'
      : '',
  );

  return { reply: lines.filter(Boolean).join('\n'), source: 'brain-cache:parent-alignment', usedLinks: [] };
}

/** "Which stream / course should I choose?" — driven by the qualification map. */
function streamChoiceAnswer(q: string, profile: StudentProfile): LocalAnswer | null {
  const wantsChoice =
    /(which|what|konsa|kaunsa|kaun sa).{0,30}(stream|subject|branch|line|field|route)|stream (choose|select|kaise|kya)|what should i (study|take|choose)|arts or science|science or commerce|commerce or arts|pcm or pcb|pcb or pcm/.test(
      q,
    );
  if (!wantsChoice) return null;

  const stage = profile.qualification as QualificationId | '';
  const fromStage = rankForInterests(stageOptionsOf(stage || undefined), profile);
  const ranked = fromStage.length > 0 ? fromStage : rankForInterests(stageOptionsOf('class10'), profile);

  const streamNote = /pcm|pcb|science|commerce|arts|humanities/.test(q)
    ? [
        '',
        '**Class 11 stream in one line each**',
        bullet('**PCM** — keeps engineering, architecture, defence technical wings and B.Sc open; the widest door, and the heaviest Maths load'),
        bullet('**PCB** — required for medicine, nursing, pharmacy and allied health, and still allows most non-engineering degrees'),
        bullet('**Commerce** — leads to B.Com, BBA, CA, CS and banking; strongest for students who like accounts and numbers'),
        bullet('**Arts / Humanities** — leads to law, civil services, media, design and teaching; the most exam-flexible stream'),
        '',
        'One caution: PCB does not keep engineering open and PCM does not keep medicine open. That single choice closes a door, so decide it on the subject you can actually study, not on prestige.',
      ]
    : [];

  const lines = [
    '🧭 **How to choose, without guessing**',
    '',
    ranked
      .slice(0, 4)
      .map((p) => bullet(`**${p.emoji} ${p.name}** — ${p.durationLabel}; needs ${p.eligibility}; best if ${p.bestFor.toLowerCase()}`))
      .join('\n'),
    ...streamNote,
    '',
    '**The honest rule:** pick the route that keeps two doors open rather than the one that sounds most impressive. A wrong stream costs two years; marks can be improved later.',
    '',
    profile.interests.length
      ? `Your profile already points here: ${profile.interests.join(', ')}.`
      : 'Complete the interest quiz in Onboarding and I will rank these for you specifically.',
    linkBlock(ranked.slice(0, 2).flatMap((p) => p.links)),
  ];
  return {
    reply: lines.join('\n'),
    source: 'brain-cache:stream-choice',
    usedLinks: ranked.slice(0, 2).flatMap((p) => p.links.map((l) => l.url)),
  };
}

/** "What can I do after Class 10 / 12 / B.Tech?" — the single most asked entry question. */
function stageOptionsAnswer(q: string, profile: StudentProfile): LocalAnswer | null {
  const wants =
    /(after (class )?(10|12|ten|twelfth)|post ?10|post ?12|what can i do|what are my options|options after|10th ke baad|12th ke baad|which course after|kya kar sakta|kya kar sakti|what should i do after)/.test(
      q,
    );
  if (!wants) return null;

  const virtuals = findAllVirtualTargets(q).slice(0, 2);
  if (virtuals.length > 0) {
    const lines: string[] = ['🎓 **What opens up after this qualification**', ''];
    for (const v of virtuals) {
      const keyword = v.id === 'btech' ? /b\.?tech|engineering|be\b/i : v.id === 'mbbs' ? /mbbs|medical|doctor/i : /ca\b|chartered|commerce/i;
      const jobs = CAREERS.filter((c) => keyword.test(c.minimumQualification)).slice(0, 4);
      lines.push(
        `**${v.label}**`,
        bullet(`Entry: ${v.entry}`),
        bullet(`Strength: ${v.strength}`),
        bullet(`Watch out: ${v.watchOut}`),
        '',
        '**Work this qualification opens directly**',
        ...jobs.map((c) => bullet(`**${c.emoji} ${c.title}** — starting ${c.startingBand}; after 5–8 years ${c.experiencedBand}`)),
        '',
      );
    }
    lines.push(
      '**Keep the next door open too:** higher study, a professional licence and government exams all run off this qualification, so note their entrance tests early.',
      linkBlock(virtuals.flatMap((v) => v.links)),
    );
    return {
      reply: lines.join('\n'),
      source: 'brain-cache:after-qualification',
      usedLinks: virtuals.flatMap((v) => v.links.map((l) => l.url)),
    };
  }

  // Prefer an explicit "after X" phrase over the saved profile. When there is no
  // stage phrase and a pathway is named ("what can I do with BCA?"), let the
  // pathway card answer instead of dumping an unrelated stage list.
  const explicitStage = detectStagePhrase(q, profile);
  const namedPathwayList = targetedPathways(q);
  const namedPathways = namedPathwayList.map((p) => p.id);

  // "What can I do with BCA?" — answer from that pathway's own next steps
  // instead of dumping an unrelated stage list.
  if (!explicitStage && namedPathwayList.length > 0) {
    const p = namedPathwayList[0];
    const lines = [
      `${p.emoji} **What ${p.name} leads to**`,
      '',
      bullet(`Course duration: ${p.durationLabel}`),
      bullet(`Where it leads next: ${p.nextSteps.slice(0, 3).join('; ')}`),
      bullet(`Government options: ${p.govtJobs.slice(0, 3).join(', ') || 'check the current official notifications'}`),
      bullet(`Private sector roles: ${p.privateJobs.slice(0, 3).join(', ') || 'depends on the specialisation you pick'}`),
      '',
      `**Honest trade-off:** strength — ${p.pros[0]}; watch out — ${p.cons[0]}`,
      '',
      'Tell me your stage ("I am in Class 10") if you want the full option list including this route.',
      linkBlock(p.links),
    ];
    return {
      reply: lines.join('\n'),
      source: 'brain-cache:pathway-next',
      usedLinks: p.links.map((l) => l.url),
    };
  }

  const stage = explicitStage ?? (profile.qualification ? (profile.qualification as QualificationId) : undefined);
  const finished = stage ? STAGE_PATHWAY[stage] : undefined;
  const options = rankForInterests(stageOptionsOf(stage), profile).filter((p) => !namedPathways.includes(p.id));
  if (options.length === 0) {
    return {
      reply: [
        '🧭 **Tell me your stage first and this answer becomes exact**',
        '',
        bullet('"What can I do after Class 10?" — streams, polytechnic diploma, ITI trades and vocational courses'),
        bullet('"What can I do after Class 12 Science / Commerce / Arts?" — degrees, professional exams and skill routes'),
        bullet('"What can I do after ITI or a diploma?" — jobs, apprenticeships, lateral entry and higher study'),
      ].join('\n'),
      source: 'brain-cache:stage-options',
      usedLinks: [],
    };
  }

  const stageInfo = QUALIFICATIONS.find((x) => x.id === stage);
  const entrance = EXAMS.filter((e) => stage && e.openTo.includes(stage)).slice(0, 4);
  const finishedPathway = finished ? PATHWAYS.find((p) => p.id === finished) : undefined;

  const lines = [
    `🧭 **Every realistic option after ${stageInfo?.label ?? 'your current stage'}**`,
    '',
    ...options.slice(0, 6).map((p) =>
      bullet(`**${p.emoji} ${p.name}** — ${p.durationLabel}; ${p.cost.government}; best if ${p.bestFor.toLowerCase()}`),
    ),
    '',
    finishedPathway
      ? bullet(`**Where ${finishedPathway.name} leads next:** ${finishedPathway.nextSteps.slice(0, 2).join('; ')}`)
      : '',
    entrance.length > 0
      ? bullet(
          `Entrance routes to plan for: ${entrance.map((e) => `${e.shortName} (${e.conductedBy})`).join(', ')} — ask me about any one of them`,
        )
      : '',
    '',
    '**How to cut six options down to one**',
    bullet('Remove any route that needs a subject you did not study — eligibility is a hard wall, not a preference.'),
    bullet('Remove any route whose yearly fee your family cannot pay without borrowing.'),
    bullet('From what remains, take the one with the shortest honest path to a real job.'),
    '',
    profile.interests.length
      ? `Your interests (${profile.interests.join(', ')}) push the top of this list upwards.`
      : 'Take the interest quiz and I will rank this list for you specifically.',
    stage === 'class12-science' && !/commerce|arts|humanities/.test(q)
      ? 'If your stream is actually Commerce or Arts, tell me — the options there are completely different.'
      : '',
    linkBlock(options.slice(0, 2).flatMap((p) => p.links)),
  ];
  return {
    reply: lines.filter(Boolean).join('\n'),
    source: 'brain-cache:stage-options',
    usedLinks: options.slice(0, 2).flatMap((p) => p.links.map((l) => l.url)),
  };
}

/** "What should I do next?" — the Roadmap tab, in chat form. */
function roadmapAnswer(q: string, profile: StudentProfile): LocalAnswer | null {
  const wants =
    /(what should i do|what do i do|next step|what next|ab kya|aage kya|plan for me|make a plan|roadmap|step by step|guide me|where do i start|how do i start|kaise start)/.test(
      q,
    );
  if (!wants) return null;

  const primary = mentionPathways(profile, 1)[0];
  const skillTrack =
    SKILL_TRACKS.find((t) => t.fits.some((f) => profile.interests.includes(f))) ?? SKILL_TRACKS[0];

  const lines: string[] = [
    '🗺️ **Your next steps, in order**',
    '',
    profile.qualification
      ? `Stage on record: **${profileStageLabel(profile)}**.`
      : 'I do not know your stage yet — say "I am in Class 10" (or 12, or a diploma) and this becomes exact.',
    '',
  ];

  if (primary) {
    const examNames = primary.entranceExams
      .map((id) => EXAMS.find((e) => e.id === id)?.shortName ?? id)
      .join(', ');

    lines.push(
      `**Next 30 days — aimed at ${primary.name}**`,
      bullet('Confirm eligibility in writing: read the current year\'s rule on the official portal, not last year\'s summary.'),
      primary.entranceExams.length > 0
        ? bullet(`Note the entrance route: ${examNames} — read the syllabus and mark the cycle window for planning.`)
        : bullet('Admission here is usually merit-based, so shortlist three nearby institutes with their cut-offs and total fees.'),
      bullet('Build a shortlist: two government options plus one private backup, with the total fee written down for each.'),
      bullet(`Start the skill track **${skillTrack.name}** (${skillTrack.weeklyHours}) — milestone one: ${skillTrack.milestones[0]}`),
      '',
      '**Over this year**',
      bullet('Protect your current marks — those are the ones that decide your next admission.'),
      bullet('Apply for the scholarships you qualify for early instead of in the last week.'),
      bullet('Talk to one person actually working in the field you are considering.'),
      '',
      '**The checklist lives in the Roadmap tab** — tick milestones there and your progress is saved on this device.',
      linkBlock([...primary.links, ...skillTrack.resources.slice(0, 1)]),
    );
  } else {
    lines.push(
      bullet('Tell me your stage so I can pick a route: "I am in Class 10", "I finished 12th Commerce", "I am doing a diploma"'),
      bullet(`Meanwhile start the **${skillTrack.name}** track (${skillTrack.weeklyHours}) — it helps in every route`),
      bullet('Write down the yearly fee your family can pay without a loan; that single number removes half the options'),
      '',
      'Ask me "which scholarships can we apply for?" while you decide.',
      linkBlock(skillTrack.resources.slice(0, 2)),
    );
  }

  return {
    reply: lines.filter(Boolean).join('\n'),
    source: 'brain-cache:roadmap',
    usedLinks: primary
      ? [...primary.links.map((l) => l.url), ...skillTrack.resources.map((r) => r.url)]
      : skillTrack.resources.map((r) => r.url),
  };
}

/** "What documents do I need?" / "When do applications open?" for scholarships. */
function scholarshipLogisticsAnswer(q: string): LocalAnswer | null {
  const wantsDocs = DOCUMENT_INTENT.test(q);
  const wantsDates = DEADLINE_INTENT.test(q);
  if (!wantsDocs && !wantsDates) return null;

  const picks = SCHOLARSHIPS.slice(0, 4);
  const lines = [
    wantsDocs ? '📄 **Documents to keep ready before you apply**' : '📅 **When scholarship applications usually open**',
    '',
    ...picks.map((s) =>
      wantsDocs
        ? bullet(`**${s.name}** — ${s.documents.join(', ')}`)
        : bullet(`**${s.name}** — ${s.window}`),
    ),
    '',
    wantsDocs
      ? 'Open a bank account in the student\'s own name, keep the name spelling identical on Aadhaar, bank and certificate records, and scan every document into one folder on your phone.'
      : 'These windows shift every year, so treat them as patterns rather than dates: bookmark the portal and check it once a month instead of trusting any summary.',
    '',
    wantsDocs
      ? 'Most rejections happen because of a name mismatch or a missing income certificate, not because the student was ineligible.'
      : 'Missing a window usually means waiting a full year, so apply in the first half of the window rather than the last week.',
    '',
    'Ask me "which scholarships can my family apply for?" for eligibility and amounts.',
    linkBlock(picks.map((s) => s.portal)),
  ];
  return {
    reply: lines.join('\n'),
    source: wantsDocs ? 'brain-cache:scholarship-documents' : 'brain-cache:scholarship-windows',
    usedLinks: picks.map((s) => s.portal.url),
  };
}

/** Defence and uniformed services routes. */
function defenceAnswer(q: string, profile: StudentProfile): LocalAnswer | null {
  if (!/(nda|defence|defense|army|navy|air ?force|military|fauj|ssb|cds|soldier|officer banna)/.test(q)) return null;
  const nda = EXAMS.find((e) => e.id === 'nda');
  const officer = CAREERS.find((c) => c.id === 'defence-officer');
  const constable = CAREERS.find((c) => c.id === 'police-constable');

  const lines: string[] = ['🎖️ **Defence routes — the honest picture**', ''];

  if (nda) {
    lines.push(
      `**NDA & NA (UPSC)** — conducted by ${nda.conductedBy}`,
      bullet(`Who can apply: ${nda.eligibility}`),
      bullet(`What it gives: ${nda.grants}`),
      bullet(`Typical cycle: ${nda.cycleWindow}`),
      bullet(`Prep needed: about ${nda.prepMonths} months of focused work`),
      '',
    );
  }
  if (officer) lines.push(bullet(`**${officer.title}** — ${officer.minimumQualification}; starting ${officer.startingBand}; demand: ${officer.demandOutlook}`));
  if (constable) lines.push(bullet(`**${constable.title}** — ${constable.minimumQualification}; starting ${constable.startingBand}`));

  lines.push(
    '',
    '**What actually decides selection, in order**',
    bullet('The written exam — Maths and General Ability for NDA. Air Force and Navy wings additionally need Physics and Maths in Class 12.'),
    bullet('The SSB interview: group tasks, psychology tests and a personal interview. Trainable, but it needs practice rather than reading.'),
    bullet('Medical and physical standards. Check these on day one — they cannot be fixed in the last month.'),
    '',
    (profile.qualification as string) === 'class12-arts' || (profile.qualification as string) === 'class12-commerce'
      ? 'Note for your stream: the Army wing of NDA accepts any stream, but Air Force and Navy wings need Physics and Maths. Ask me "NDA vs JEE" if you are weighing both.'
      : 'One practical point: keep a backup route running. Defence selection has genuine uncertainty, and a diploma or degree alongside keeps every other option open.',
    linkBlock(nda ? [{ label: 'UPSC official portal (NDA notifications)', url: nda.officialUrl }] : []),
  );

  return { reply: lines.filter(Boolean).join('\n'), source: 'brain-cache:defence', usedLinks: nda ? [nda.officialUrl] : [] };
}

/** ITI trades and admission after Class 10. */
function itiAnswer(q: string, profile: StudentProfile): LocalAnswer | null {
  if (!/(iti|iti trade|electrician|fitter|welder|welding|copa|turner|machinist|plumber|vocation)/.test(q)) return null;

  const iti = PATHWAYS.find((p) => p.id === 'iti');
  const admission = EXAMS.find((e) => e.id === 'iti-state-counselling');
  const naps = OPPORTUNITIES.find((o) => o.id === 'naps-apprenticeship');
  const electrician = CAREERS.find((c) => c.id === 'industrial-electrician');

  const lines: string[] = ['🔧 **ITI — the fastest skill-to-income route after Class 10**', ''];

  if (iti) {
    lines.push(
      `**${iti.name}**`,
      bullet(`Duration: ${iti.durationLabel}`),
      bullet(`Eligibility: ${iti.eligibility}`),
      bullet(`Government cost: ${iti.cost.government}`),
      bullet(`Where it leads: ${iti.nextSteps.slice(0, 2).join('; ')}`),
      '',
    );
  }
  if (admission) {
    lines.push(
      '**Admission**',
      bullet(`Route: ${admission.eligibility}`),
      bullet(`Typical cycle: ${admission.cycleWindow}`),
      bullet(`Note: ${admission.notes}`),
      '',
    );
  }

  lines.push(
    '**Trades with steady local demand**',
    bullet('Electrician, Fitter, Welder and COPA (computer operator) are the most consistently hired trades'),
    bullet('Choose the trade by the workshops and factories near you, not by the trade with the nicest name'),
    '',
    electrician
      ? bullet(`**${electrician.title}** — starting ${electrician.startingBand}; after 5–8 years ${electrician.experiencedBand}`)
      : '',
    naps ? bullet(`**${naps.name}** — ${naps.stipend}`) : '',
    '',
    (profile.qualification as string) === 'iti'
      ? 'You already hold the certificate — the next move is a paid apprenticeship (NAPS) or lateral entry into a polytechnic diploma, which later opens B.Tech 2nd year.'
      : (profile.qualification as string) === 'class10'
        ? 'Admission opens right after the Class 10 results through your state portal, so keep the marksheet and Aadhaar ready for that window.'
        : '**The route stays open:** an ITI certificate can be followed by a polytechnic diploma, which then allows lateral entry into B.Tech 2nd year. Nothing here is a dead end.',
    linkBlock([
      ...(iti?.links ?? []),
      ...(naps ? [naps.portal] : []),
      ...(admission ? [{ label: 'ITI admission portal (DGT)', url: admission.officialUrl }] : []),
    ]),
  );

  return {
    reply: lines.filter(Boolean).join('\n'),
    source: 'brain-cache:iti',
    usedLinks: [
      ...(iti?.links.map((l) => l.url) ?? []),
      ...(naps ? [naps.portal.url] : []),
      ...(admission ? [admission.officialUrl] : []),
    ],
  };
}

/** Failed, dropped out, or taking a gap year — the questions nobody wants to ask. */
function setbackAnswer(q: string, profile: StudentProfile): LocalAnswer | null {
  const wants = /(failed|fail ho|drop ?out|dropout|left school|chhoda|padhai chhod|gap year|backlog|compartment|reappear|second attempt|repeat year|year wasted|ek saal waste)/.test(
    q,
  );
  if (!wants) return null;

  const iti = PATHWAYS.find((p) => p.id === 'iti');
  const vocational = PATHWAYS.find((p) => p.id === 'vocational');
  const polytechnic = PATHWAYS.find((p) => p.id === 'polytechnic');
  const skills = SKILL_TRACKS.slice(0, 2);
  const nios = { label: 'NIOS — National Institute of Open Schooling', url: 'https://www.nios.ac.in' };

  const lines: string[] = [
    '🌱 **One exam does not close a route. Here is what genuinely stays open.**',
    '',
    profile.qualification
      ? `From your stage (${profileStageLabel(profile)}), the options below stay open — nothing on this list needs the result you are worried about.`
      : 'Tell me your stage along with what happened, and I will make this specific.',
    bullet('**If you can reappear:** take the compartment or improvement attempt. Clearing it keeps every regular route open, and that is usually worth one extra year.'),
    bullet('**If you cannot wait:** ITI trades and vocational certificates let you start earning while you finish school through open schooling.'),
    bullet('**Open school is real:** NIOS and state open schools let you complete Class 10 or 12 at your own pace, and those certificates are accepted for higher study and most government posts.'),
    '',
  ];

  if (vocational) {
    lines.push(
      `**${vocational.emoji} ${vocational.name}**`,
      bullet(`Duration: ${vocational.durationLabel}`),
      bullet(`Eligibility: ${vocational.eligibility}`),
      bullet(`Cost: ${vocational.cost.government}`),
      bullet(`First step it opens: ${vocational.nextSteps[0]}`),
      '',
    );
  }
  if (iti) {
    lines.push(
      `**${iti.emoji} ${iti.name}**`,
      bullet(`Eligibility: ${iti.eligibility} — note that some trades accept Class 8, so a Class 10 result is not a hard stop.`),
      bullet(`Cost: ${iti.cost.government}`),
      '',
    );
  }
  if (polytechnic) {
    lines.push(bullet(`**Polytechnic diploma** — ${polytechnic.eligibility}. If a state runs merit admission, ask about its minimum percentage before assuming you are out.`), '');
  }

  lines.push(
    '**Start one skill this month — it does not depend on any certificate**',
    ...skills.map((t) => bullet(`**${t.name}** — ${t.timeToFirstProject}; first project: ${t.beginnerProjects[0]}`)),
    '',
    'Tell me exactly what happened — "I failed Class 10", "I dropped out of 12th Science", "I have a one-year gap" — and I will lay out the exact next step for that situation.',
    linkBlock([...(vocational?.links ?? []), nios, ...skills.flatMap((t) => t.resources.slice(0, 1))]),
  );

  return {
    reply: lines.filter(Boolean).join('\n'),
    source: 'brain-cache:setback',
    usedLinks: [...(vocational?.links.map((l) => l.url) ?? []), nios.url, ...skills.flatMap((t) => t.resources.map((r) => r.url))],
  };
}

/** What this app contains and how to use it. */
function appGuideAnswer(q: string): LocalAnswer | null {
  const wants =
    /(how (do|to) (i )?use (this )?app|how does (this )?app work|which tab|what is (in )?(the )?(explore|guide|compare|roadmap) tab|app kaise|app me kya|how to (use|navigate) (this|the) app|what does this app do|what is pathmitra)/.test(
      q,
    );
  if (!wants) return null;

  return {
    reply: [
      '📱 **How PathMitra is organised**',
      '',
      bullet('**Home** — the routes that fit your profile best, with the reasons why'),
      bullet('**Explore** — streams and pathways: duration, fees, subjects, and where each one leads'),
      bullet('**Guide** — exams, careers, scholarships with official portals, plus skills worth learning'),
      bullet('**Compare** — any two routes side by side on fees, time and outcomes'),
      bullet('**Roadmap** — a personal checklist, saved on your own device'),
      bullet('**Advisor** — that is me. I answer from the same data these tabs use, so the chat never disagrees with the screens'),
      '',
      'Your profile stays in your browser. Filling it in makes every answer specific to your stage, budget and priorities.',
      '',
      'Try asking me: **"diploma vs B.Tech in computer science"** or **"what should I do next?"**',
    ].join('\n'),
    source: 'brain-cache:app-guide',
    usedLinks: [],
  };
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

function madhyamikAnswer(): LocalAnswer {
  return {
    reply: [
      '📘 **Madhyamik is West Bengal’s Class 10 secondary examination**',
      '',
      bullet('It is conducted by the West Bengal Board of Secondary Education (WBBSE).'),
      bullet('After passing, you can choose Class 11, a polytechnic diploma, ITI or other vocational routes.'),
      bullet('For higher secondary, your stream choice is usually Science, Commerce or Arts, depending on your marks and school options.'),
      '',
      'Check the current syllabus, registration dates and results on the official board website.',
      linkBlock([{ label: 'WBBSE official website', url: 'https://wbbse.wb.gov.in' }]),
    ].join('\n'),
    source: 'brain-cache:school-exam',
    usedLinks: ['https://wbbse.wb.gov.in'],
  };
}

/** "What is the next best career/opportunity for me?" — from the stage playbooks. */
function nextBestAnswer(q: string, profile: StudentProfile): LocalAnswer | null {
  const wants =
    /(next best|best career|career opportunit|career option|which career|top career|career for|konsa career|career path|job opportunit|best move for me|best option for me|best course for me)/.test(
      q,
    );
  if (!wants) return null;

  const guide = findStageGuide(profile.qualification);
  if (!guide) {
    return {
      reply: [
        '🚀 **Tell me your stage and I will rank the next best moves for exactly that stage**',
        '',
        bullet('"I am in Class 12 Science" — entrances, degrees, nursing and defence routes'),
        bullet('"I finished my diploma / ITI" — apprenticeships, JE exams, lateral entry'),
        bullet('"I completed my degree" — placements, internships, SSC CGL and banking'),
        bullet('"I am an MBBS / nursing student" — PG entrance and government service routes'),
        '',
        'Or set your stage once in the Profile tab and every answer becomes specific.',
      ].join('\n'),
      source: 'brain-cache:next-best',
      usedLinks: [],
    };
  }

  const picks = guide.nextBest.slice(0, 4);
  const reply = [
    `🚀 **${guide.headline}**`,
    '',
    guide.summary,
    '',
    `**Your next best moves, in order (${QUALIFICATION_LABELS[profile.qualification as QualificationId] ?? 'your stage'})**`,
    ...picks.flatMap((card) => [
      bullet(`**${card.title}** (${card.category}) — ${card.why}`),
      ...card.actions.slice(0, 2).map((a) => `  - ${a}`),
    ]),
    '',
    '**Watch out**',
    bullet(guide.pitfalls[0]),
    '',
    'The **Next best move** tab in the Guide shows the full ranked playbook with portals, and the **Placements & internships** tab has the readiness checklist and hiring tests.',
    linkBlock(picks.flatMap((c) => c.links)),
  ].join('\n');
  return {
    reply,
    source: 'brain-cache:next-best',
    usedLinks: picks.flatMap((c) => c.links.map((l) => l.url)),
  };
}

/** "How do I get placed / find internships?" — the placements hub in chat form. */
function placementAnswer(q: string, profile: StudentProfile): LocalAnswer | null {
  const wants =
    /(placement|placements|get placed|placed in|campus (drive|placement|interview)|off.?campus|hiring (test|drive)|nqt|elitmus|amcat|job (ready|hunt)|get (a )?job|job search|how to apply for jobs)/.test(
      q,
    );
  if (!wants) return null;

  const checklist = placementChecklistFor(profile.qualification);
  const pool = profile.qualification ? opportunitiesFor(profile.qualification) : OPPORTUNITIES;
  const tests = pool.filter((o) => o.type === 'placement-drive' || o.type === 'job-portal').slice(0, 3);
  const internships = pool.filter((o) => o.type === 'internship' || o.type === 'apprenticeship').slice(0, 2);

  const lines = [
    '💼 **How students actually get placed — checklist first, luck later**',
    '',
    '**Your readiness checklist, in order**',
    ...checklist.slice(0, 5).map((c, i) => bullet(`${i + 1}. ${c}`)),
    '',
  ];

  if (tests.length > 0) {
    lines.push('**Standardised hiring tests and drives open to you**');
    lines.push(...tests.map((o) => bullet(`**${o.name}** — ${o.eligibility}`)));
    lines.push('');
  }
  if (internships.length > 0) {
    lines.push('**Internships and apprenticeships that convert**');
    lines.push(...internships.map((o) => bullet(`**${o.name}** — ${o.stipend}`)));
    lines.push('');
  }

  lines.push(
    'Volume plus proof: 5 relevant applications a week, one public project link, one practice-test score. That system outperforms any placement cell.',
    linkBlock([...tests, ...internships].map((o) => o.portal)),
  );
  return {
    reply: lines.filter(Boolean).join('\n'),
    source: 'brain-cache:placements',
    usedLinks: [...tests, ...internships].map((o) => o.portal.url),
  };
}

// ----------------------------------------------------------------------------
// Intent router for the extended knowledge, plus short follow-up handling.
// Order matters: the most specific chains are tried before the general ones so
// a question like "diploma fees" never collapses into a generic cost overview.
// ----------------------------------------------------------------------------

/** "JEE Main vs WBJEE" style comparisons that are not pathways or degree targets. */
function examVersusExamIntent(q: string): LocalAnswer | null {
  const wantsCompare =
    q.includes(' vs ') || q.includes(' vs.') || q.includes(' v/s ') || q.includes('versus') ||
    q.includes('which is better') || q.includes('compare') || q.includes('difference between');
  if (!wantsCompare) return null;
  const ids = findExamsInQuery(q);
  if (ids.length >= 2) return examVsExam(ids[0], ids[1]);
  return null;
}

/** The extended chains, most specific first. Order is deliberate: a family or
 * setback question wins over a generic stage listing, and a named route always
 * beats the overview answers. */
function checkExtendedIntents(q: string, profile: StudentProfile): LocalAnswer | null {
  return (
    examVersusExamIntent(q) ??
    scholarshipLogisticsAnswer(q) ??
    parentAnswer(q, profile) ??
    defenceAnswer(q, profile) ??
    itiAnswer(q, profile) ??
    costAnswer(q, profile) ??
    timeAnswer(q, profile) ??
    salaryAnswer(q, profile) ??
    govtJobAnswer(q, profile) ??
    setbackAnswer(q, profile) ??
    nextBestAnswer(q, profile) ??
    placementAnswer(q, profile) ??
    streamChoiceAnswer(q, profile) ??
    stageOptionsAnswer(q, profile) ??
    roadmapAnswer(q, profile) ??
    appGuideAnswer(q)
  );
}

/** True when the message is a short follow-up that only makes sense with context. */
function followUpIntent(q: string): boolean {
  const wordCount = q.split(/\s+/).filter(Boolean).length;
  if (wordCount <= 7 && COST_INTENT.test(q)) return true;
  if (wordCount <= 7 && SALARY_INTENT.test(q)) return true;
  if (wordCount <= 7 && DEADLINE_INTENT.test(q)) return true;
  if (wordCount <= 7 && DOCUMENT_INTENT.test(q)) return true;
  if (wordCount <= 7 && TIME_INTENT.test(q)) return true;
  return q.length < 70 && /^(and|what about|aur|toh|then|why|kyun|kaise|how about|ok but|but what|iska|uska|\?+)\b/.test(q);
}

/**
 * Short follow-ups ("and the fees?", "what about for SC students?") carry no
 * subject on their own. Re-running the matchers against the previous student
 * question plus this message keeps the answer grounded and offline.
 */
export function contextualFollowUp(
  question: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  profile: StudentProfile,
): LocalAnswer | null {
  const q = question.toLowerCase().trim();
  if (!followUpIntent(q)) return null;

  const previousUser = [...history].reverse().find((turn) => turn.role === 'user')?.content;
  if (!previousUser) return null;

  const merged = `${previousUser} ${q}`.toLowerCase().slice(0, 400);
  const direct = checkExtendedIntents(merged, profile) ?? comparisonAnswer(merged, profile);
  if (direct) return direct;

  const pathwayIds = findPathwaysInQuery(merged);
  if (pathwayIds.length > 0) {
    const answer = pathwayAnswer(pathwayIds[0]);
    if (answer) return answer;
  }
  const examIds = findExamsInQuery(merged);
  if (examIds.length > 0) {
    const answer = examAnswer(examIds[0]);
    if (answer) return answer;
  }
  return null;
}

export function answerLocally(question: string, profile: StudentProfile): LocalAnswer | null {
  const q = question.toLowerCase();
  const queryTokens = tokens(question);

  // 0. Small talk and capability questions — answer instantly, no match needed.
  const smallTalk = smallTalkAnswer(q, profile);
  if (smallTalk) return smallTalk;

  // Do not let broad dataset matchers turn a named company's scholarship
  // question into an unrelated career or pathway answer.
  if (isOrganizationScholarshipQuestion(q)) return null;

  // 1. Comparison questions ("X vs Y", "which is better") come before single
  // matches so a two-option query never collapses into one exam card.
  const comparison = comparisonAnswer(q, profile);
  if (comparison) return comparison;

  // 1b. Extended grounded knowledge — fees, salary, government jobs, duration,
  // family alignment, stage options, roadmap, setbacks, app help. All of these
  // are assembled from the bundled datasets, so they never need an API call.
  const extended = checkExtendedIntents(q, profile);
  if (extended) return extended;

  // 2. High-frequency intent rules next.
  const lateralIntent =
    (q.includes('lateral') || q.includes('2nd year') || q.includes('second year') || q.includes('without jee')) &&
    (q.includes('diploma') || q.includes('polytechnic') || q.includes('b.tech') || q.includes('btech'));
  if (lateralIntent) return lateralEntryAnswer();

  if (q.includes('svmcm') || q.includes('svm cms') || q.includes('swami vivekananda merit')) {
    return svmcmAnswer();
  }

  if (isGenericScholarshipQuestion(q)) {
    return scholarshipAnswer(profile);
  }

  if (q.includes('madhyamik') || q.includes('madyamik')) {
    return madhyamikAnswer();
  }

  // 3. Exam match by name and short name. Short-name boost applies only to
  // standalone mentions (word-boundary) so "science" never triggers "sc" and
  // "computer" never triggers a stray substring hit.
  let bestExam = { id: '', score: 0 };
  for (const exam of EXAMS) {
    const haystack = `${exam.name} ${exam.shortName} ${exam.category} ${exam.grants}`;
    const shortMentioned = new RegExp(`\\b${escapeRegExp(exam.shortName.toLowerCase())}\\b`).test(q);
    const score = scoreMatch(haystack, queryTokens) + (shortMentioned ? 6 : 0);
    if (score > bestExam.score) bestExam = { id: exam.id, score };
  }
  if (bestExam.score >= 3) {
    const answer = examAnswer(bestExam.id);
    if (answer) return answer;
  }

  // 4. Pathway match.
  let bestPathway = { id: '', score: 0 };
  for (const p of PATHWAYS) {
    const haystack = `${p.name} ${p.shortName} ${p.bestFor} ${p.syllabus.join(' ')}`;
    const shortMentioned = p.shortName.length > 3 && q.includes(p.shortName.toLowerCase());
    const score = scoreMatch(haystack, queryTokens) + (shortMentioned ? 6 : 0);
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
    const pool = profile.qualification ? opportunitiesFor(profile.qualification) : OPPORTUNITIES;
    const items = pool
      .filter((o) => o.type === 'apprenticeship' || o.type === 'internship' || o.type === 'placement-drive')
      .slice(0, 4);
    const reply = [
      '🧰 **Paid training routes: internships, apprenticeships and hiring tests**',
      '',
      ...items.map((o) => bullet(`**${o.name}** — ${o.eligibility}. ${o.stipend}`)),
      '',
      profileSummary(profile) ? `Your profile so far: ${profileSummary(profile)}` : '',
      'The Placements & internships tab in the Guide has the full list with the readiness checklist.',
      linkBlock(items.map((o) => o.portal)),
    ].filter(Boolean).join('\n');
    return { reply, source: 'brain-cache:opportunities', usedLinks: items.map((o) => o.portal.url) };
  }

  return null;
}

export function profileSummary(profile: StudentProfile): string {
  return profile.qualification ? describeProfile(profile) : '';
}