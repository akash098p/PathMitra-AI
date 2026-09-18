import type { Scenario } from '@/lib/types';

// ============================================================================
// Cost & outcome simulator.
// Figures are indicative all-India ranges for 2025-26 in Indian Rupees. They
// are deliberately wide because the same course can cost ₹5,000 a year in a
// government institute and ₹2.5 lakh in a private one — that gap is exactly
// what a family needs to see before deciding.
// ============================================================================

export interface CostEstimate {
  low: number;
  high: number;
  years: number;
  perYearLow: number;
  perYearHigh: number;
  note: string;
}

export function estimateCost(perYearLow: number, perYearHigh: number, years: number, note: string): CostEstimate {
  return {
    low: perYearLow * years,
    high: perYearHigh * years,
    years,
    perYearLow,
    perYearHigh,
    note,
  };
}

export function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} crore`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} lakh`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}k`;
  return `₹${amount}`;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'pcm-to-btech',
    title: 'Science PCM → B.Tech Engineering',
    emoji: '🧪',
    summary:
      'Two years of Class 11–12 science (usually with JEE coaching), then four years of engineering. The most travelled road in urban India, and the most expensive one before the first salary.',
    steps: [
      { label: 'Class 11–12 (PCM)', detail: 'School fees plus JEE coaching where families can afford it', years: 2, cost: '₹20,000 – ₹1.5 lakh per year, plus coaching' },
      { label: 'JEE Main / state CET', detail: 'Two attempts a year; also opens state counselling', years: 0.5, cost: '₹1,000 – ₹10,000 in exam fees' },
      { label: 'B.Tech (4 years)', detail: 'Government seats are cheap, private seats are not', years: 4, cost: '₹60,000 – ₹2.5 lakh per year' },
      { label: 'First job', detail: 'Campus placement, services company or product firm', years: 0, cost: 'Starting ₹3.5 – ₹15 lakh per year depending on employer tier' },
    ],
    totalYears: 6.5,
    costLow: 280000,
    costHigh: 1420000,
    firstEarningAge: 22,
    upsides: [
      'Widest set of career options after graduation, including non-engineering jobs',
      'Campus placement is structured at most colleges — a real advantage for first-generation students',
      'Higher ceiling: a product-company offer can start at ₹15 lakh a year',
    ],
    downsides: [
      'Six and a half years with almost no income, with coaching costs on top',
      'If JEE does not go well, private college fees can exceed ₹10 lakh in total',
      'A large share of graduates do not get a job in their core branch',
    ],
  },
  {
    id: 'diploma-lateral',
    title: 'Polytechnic Diploma → Work → Lateral B.Tech',
    emoji: '🏭',
    summary:
      'Three years of a hands-on diploma after Class 10, then either a job at 19 or lateral entry into the second year of B.Tech. The cheapest realistic path to an engineering degree.',
    steps: [
      { label: 'Diploma (3 years)', detail: 'Government polytechnic through JEXPO / JEECUP / POLYCET-type tests', years: 3, cost: '₹5,000 – ₹80,000 per year' },
      { label: 'Apprenticeship or first job', detail: 'NATS / NAPS apprenticeship with a stipend, or a junior engineer role', years: 1, cost: 'Earning: ₹10,000 – ₹25,000 per month' },
      { label: 'Lateral entry to B.Tech 2nd year', detail: 'Through the state lateral entry test — no JEE Main needed', years: 3, cost: '₹60,000 – ₹2 lakh per year, often financed from salary' },
      { label: 'Engineer with work experience', detail: 'Graduates at roughly the same age as the B.Tech route but with four years of work history', years: 0, cost: 'Salary at this point usually exceeds a fresh B.Tech graduate' },
    ],
    totalYears: 7,
    costLow: 210000,
    costHigh: 800000,
    firstEarningAge: 19,
    upsides: [
      'Starts earning at about 19 instead of 22 — three extra earning years',
      'AICTE recognises lateral entry, so the final degree is a full B.Tech/B.E.',
      'Practical, lab-heavy learning suits students who dislike pure theory',
      'The degree can be paid for from the salary earned along the way',
    ],
    downsides: [
      'Top-tier IT campus placement is harder from the diploma route than through JEE',
      'Two transitions — diploma, then lateral entry — both need planning and test preparation',
      'Institute quality varies a lot, so AICTE approval must be verified before admission',
    ],
  },
  {
    id: 'iti-apprentice',
    title: 'ITI Trade → Apprenticeship → Technician Job',
    emoji: '⚙️',
    summary:
      'A one-to-two-year trade certificate after Class 10, then a paid apprenticeship and a technician job. The fastest route from school to a salary.',
    steps: [
      { label: 'ITI trade certificate', detail: 'Electrician, fitter, COPA, welding, motor mechanic and similar trades', years: 1.5, cost: '₹500 – ₹50,000 per year' },
      { label: 'Apprenticeship (NATS / NAPS)', detail: 'Paid training with a registered establishment', years: 1, cost: 'Earning: ₹8,000 – ₹15,000 per month stipend' },
      { label: 'Technician job or self-employment', detail: 'Railways, PSUs, factories, service networks, or your own workshop', years: 0, cost: 'Starting ₹12,000 – ₹25,000 per month' },
      { label: 'Upskilling', detail: 'CNC, PLC, solar, EV or network technician certifications', years: 1, cost: '₹5,000 – ₹40,000 total, usually funded from wages' },
    ],
    totalYears: 3.5,
    costLow: 6000,
    costHigh: 180000,
    firstEarningAge: 18,
    upsides: [
      'Lowest possible investment — a government ITI can cost less than ₹10,000 in total',
      'Earning starts at 18 with no education loan and no family debt',
      'Railways, PSUs and industry hire technicians continuously',
      'Skilled trades can lead to self-employment, which has no salary ceiling',
    ],
    downsides: [
      'Salary ceiling is lower unless a diploma or degree is added later',
      'Software and white-collar roles are effectively closed on this route alone',
      'Trade choice decides everything — pick a trade that actually hires in your district',
    ],
  },
  {
    id: 'commerce-ca',
    title: 'Commerce → B.Com with CA / CS',
    emoji: '📊',
    summary:
      'Class 11–12 commerce, then a professional qualification alongside a degree. Very low cost and a very high income ceiling, but the exam grind is severe.',
    steps: [
      { label: 'Class 11–12 (Commerce + Maths/IP)', detail: 'Accountancy, Business Studies, Economics', years: 2, cost: '₹2,000 – ₹1.2 lakh per year' },
      { label: 'CA Foundation + B.Com', detail: 'Foundation exam with a parallel degree as a safe fallback', years: 1, cost: '₹10,000 – ₹40,000 including registration' },
      { label: 'CA Intermediate + articleship', detail: 'Paid articleship training with a practising chartered accountant', years: 3, cost: 'Earning: a modest stipend during articleship' },
      { label: 'CA Final and practice', detail: 'Qualified CA, or exit with B.Com and a commerce job', years: 1, cost: 'Starting ₹8 – ₹12 lakh per year as a qualified CA' },
    ],
    totalYears: 6,
    costLow: 25000,
    costHigh: 400000,
    firstEarningAge: 21,
    upsides: [
      'Total cost can stay under ₹30,000 because ICAI study material is cheap and self-study is normal',
      'A qualified CA often earns more at 24 than most engineers at 24',
      'Can be done from any town, since articleship is available locally',
    ],
    downsides: [
      'Pass rates at each level are genuinely low; many students repeat attempts for years',
      'Without a parallel degree, failing twice leaves the student with no qualification at all',
      'The articleship years pay very little',
    ],
  },
    {
    id: 'pcb-to-mbbs',
    title: 'Science PCB → NEET → MBBS / Allied Health',
    emoji: '🩺',
    summary:
      'Class 11–12 biology with NEET preparation, then five and a half years of MBBS. The cost difference between a government seat and a private seat is the entire financial story.',
    steps: [
      { label: 'Class 11–12 (PCB)', detail: 'School fees plus NEET coaching where affordable', years: 2, cost: '₹20,000 – ₹1.5 lakh per year, plus coaching' },
      { label: 'NEET-UG', detail: 'One attempt a year with very high competition', years: 1, cost: '₹2,000 – ₹5,000 in exam fees' },
      { label: 'MBBS (5.5 years with internship)', detail: 'Government seat versus private seat decides the total cost', years: 5.5, cost: 'Government ₹10,000 – ₹1 lakh per year; private ₹8 lakh – ₹25 lakh per year' },
      { label: 'Practice or PG preparation', detail: 'Government service, private hospital, or PG entrance', years: 0, cost: 'Starting ₹60,000 – ₹1 lakh per month for a practising doctor' },
    ],
    totalYears: 8.5,
    costLow: 90000,
    costHigh: 15000000,
    firstEarningAge: 25,
    upsides: [
      'Highest social respect of any Indian profession, with a stable lifelong income',
      'A government MBBS seat costs less in total than a private engineering degree',
      'Allied health — nursing, physiotherapy, lab science — gives a far cheaper healthcare entry',
    ],
    downsides: [
      'Without a government seat, private MBBS can exceed ₹1 crore in total cost',
      'Eight and a half years before real income, with years of exam stress',
      'NEET re-attempts are common, which stretches the timeline further',
    ],
  },
];

export function findScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

const FIRST_SALARY_BAND: Record<string, number> = {
  'pcm-to-btech': 350000,
  'diploma-lateral': 240000,
  'iti-apprentice': 180000,
  'commerce-ca': 900000,
  'pcb-to-mbbs': 720000,
};

/** Payback framing for parents: total cost measured in years of a starting salary. */
export function paybackNote(scenario: Scenario): string {
  const annual = FIRST_SALARY_BAND[scenario.id] ?? 240000;
  const low = Math.max(1, Math.round(scenario.costLow / annual));
  const high = Math.max(1, Math.round(scenario.costHigh / annual));
  return `Even on the most expensive version of this route, the total cost is roughly ${high} year(s) of a starting salary — and about ${low} year(s) on the cheapest version.`;
}

/** Cost of study before the first salary, in years. */
export function studyYearsBeforeIncome(scenario: Scenario): number {
  return Math.max(0, Math.round((scenario.firstEarningAge - 18) * 10) / 10);
}
