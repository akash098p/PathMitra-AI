import { EXAMS } from '@/data/exams';
import { PATHWAYS } from '@/data/pathways';
import { CAREERS } from '@/data/careers';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { SKILL_TRACKS } from '@/data/skills';
import { OPPORTUNITIES } from '@/data/opportunities';
import { STATES } from '@/data/states';
import { describeProfile } from '@/lib/profile';
import { getTimeGreeting } from '@/lib/greeting';
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
        bullet('Open the Explore tab for streams, the Guide tab for exams, fees, jobs and scholarships'),
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
    (q.includes('help') && q.length < 30) || q.includes('who are you') || q.includes('about yourself') ||
    q.includes('introduce yourself')
  ) {
    return {
      reply: [
        '🤖 **Here is what I can do for you:**',
        '',
        bullet('**Compare routes** — "PCM vs diploma", "ITI vs polytechnic", with fees and time to first salary'),
        bullet('**Explain exams** — JEE, NEET, CUET, JEXPO, JELET, NDA and 25+ more, with official portals'),
        bullet('**Find money** — scholarships and fee waivers your family can actually apply for'),
        bullet('**Show jobs** — government and private careers with real starting pay bands'),
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
      if (alias.trim().length < 2) continue;
      const idx = q.indexOf(alias);
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
  return new RegExp(`\b${escapeRegExp(alias)}\b`).test(q);
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