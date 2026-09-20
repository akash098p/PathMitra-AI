import type { InterestQuestion, QualificationId } from '@/lib/types';

// ============================================================================
// Interest diagnostic — one question set PER STAGE.
// No student should be forced to name a career at 16, so every quiz asks about
// the work, never about job titles. But the work a Class 10 student can judge is
// different from the work a medical intern, a diploma holder or a graduate can
// judge — so the questions, options and vocabulary change with the stage.
// ============================================================================

export type InterestQuizGroup =
  | 'school'
  | 'senior'
  | 'technical'
  | 'degree'
  | 'graduate'
  | 'medical'
  | 'teaching'
  | 'postgrad';

/** Which quiz a stage gets. Every stage maps to exactly one group. */
export const STAGE_QUIZ_GROUP: Record<QualificationId, InterestQuizGroup> = {
  class10: 'school',
  class11: 'school',
  'class12-science': 'senior',
  'class12-commerce': 'senior',
  'class12-arts': 'senior',
  diploma: 'technical',
  iti: 'technical',
  'btech-student': 'degree',
  undergraduate: 'degree',
  'medical-student': 'medical',
  'b-ed-student': 'teaching',
  graduate: 'graduate',
  postgraduate: 'postgrad',
};

const SCHOOL_QUESTIONS: InterestQuestion[] = [
  {
    id: 'weekend',
    prompt: 'A free Sunday with no homework. What actually pulls you in?',
    options: [
      { label: 'Fixing or building something with my hands', interests: ['hands-on'], emoji: '🔧' },
      { label: 'Trying a new app, game mod, or small program', interests: ['coding'], emoji: '💻' },
      { label: 'Drawing, editing videos, or designing posters', interests: ['design', 'media'], emoji: '🎨' },
      { label: 'Reading about money, business, or a new scheme', interests: ['business'], emoji: '📈' },
    ],
  },
  {
    id: 'subject',
    prompt: 'Which school subject feels least like a burden?',
    options: [
      { label: 'Mathematics and Physics', interests: ['research', 'coding'], emoji: '🧮' },
      { label: 'Biology and Chemistry', interests: ['medicine', 'research'], emoji: '🧬' },
      { label: 'History, Civics, and Languages', interests: ['law', 'govt-service', 'media'], emoji: '📜' },
      { label: 'Accounts, Economics, and Statistics', interests: ['business'], emoji: '🧾' },
    ],
  },
  {
    id: 'worklife',
    prompt: 'Which working picture appeals to you most?',
    options: [
      { label: 'A desk, a laptop, solving technical puzzles', interests: ['coding', 'design'], emoji: '🧑‍💻' },
      { label: 'A hospital, clinic, or laboratory', interests: ['medicine'], emoji: '🏥' },
      { label: 'A site, workshop, or factory floor', interests: ['hands-on'], emoji: '🏗️' },
      { label: 'A court, office, or field posting for the country', interests: ['defence', 'govt-service', 'law'], emoji: '🏛️' },
    ],
  },
  {
    id: 'stability',
    prompt: 'What matters more to you personally?',
    options: [
      { label: 'A predictable, secure government career', interests: ['govt-service', 'defence'], emoji: '🛡️' },
      { label: 'Fast growth and high pay in private industry', interests: ['coding', 'business'], emoji: '🚀' },
      { label: 'Respect and the chance to serve people', interests: ['medicine', 'teaching', 'govt-service'], emoji: '🤝' },
      { label: 'Freedom to create my own thing', interests: ['design', 'media', 'business'], emoji: '✨' },
    ],
  },
  {
    id: 'environment',
    prompt: 'Where and how do you want to live while you study?',
    options: [
      { label: 'Stay at home, study in my own city or state', interests: ['govt-service', 'agriculture'], emoji: '🏠' },
      { label: 'Move anywhere in India for the best college', interests: ['research', 'coding', 'medicine'], emoji: '🚆' },
      { label: 'Outside in fields, plants, nature, animals', interests: ['agriculture', 'research'], emoji: '🌾' },
      { label: 'Somewhere I can train physically every day', interests: ['defence', 'hands-on'], emoji: '🏃' },
    ],
  },
];

const SENIOR_QUESTIONS: InterestQuestion[] = [
  {
    id: 'senior-focus',
    prompt: 'Boards are close. Which part of your syllabus do you actually not mind?',
    options: [
      { label: 'Maths-heavy problem sets and derivations', interests: ['research', 'coding'], emoji: '🧮' },
      { label: 'Biology, diagrams and human body chapters', interests: ['medicine', 'research'], emoji: '🧬' },
      { label: 'Accounts, business studies and economics', interests: ['business', 'law'], emoji: '🧾' },
      { label: 'History, political science and essays', interests: ['law', 'media', 'teaching'], emoji: '📜' },
    ],
  },
  {
    id: 'senior-exam',
    prompt: 'Which entrance exam would you genuinely enjoy preparing for?',
    options: [
      { label: 'JEE / state engineering CET', interests: ['coding', 'research'], emoji: '⚙️' },
      { label: 'NEET and the health sciences', interests: ['medicine'], emoji: '🩺' },
      { label: 'CUET / central university general test', interests: ['govt-service', 'teaching', 'law'], emoji: '🏛️' },
      { label: 'CLAT, design or hotel-management style tests', interests: ['law', 'design', 'media'], emoji: '⚖️' },
    ],
  },
  {
    id: 'senior-next',
    prompt: 'What would make the next three or four years worth it?',
    options: [
      { label: 'A degree that gets me a job quickly', interests: ['hands-on', 'coding', 'business'], emoji: '⚡' },
      { label: 'A profession with respect and stability', interests: ['govt-service', 'medicine', 'teaching'], emoji: '🛡️' },
      { label: 'A subject I can study deeper, even up to research', interests: ['research', 'teaching'], emoji: '🔬' },
      { label: 'Work where I create things people see or use', interests: ['design', 'media'], emoji: '🎨' },
    ],
  },
  {
    id: 'senior-setting',
    prompt: 'Which working setting feels most like you?',
    options: [
      { label: 'A site, workshop or plant floor', interests: ['hands-on'], emoji: '🏗️' },
      { label: 'A hospital, clinic or laboratory', interests: ['medicine', 'research'], emoji: '🏥' },
      { label: 'A desk with data, code and targets', interests: ['coding', 'business'], emoji: '🧑‍💻' },
      { label: 'A court, classroom, studio or newsroom', interests: ['law', 'teaching', 'media', 'design'], emoji: '🎙️' },
    ],
  },
  {
    id: 'senior-family',
    prompt: 'Honestly — what does your family expect from this decision?',
    options: [
      { label: 'A government job, whatever the field', interests: ['govt-service', 'defence'], emoji: '🏛️' },
      { label: 'A recognised professional degree (doctor, engineer, teacher, lawyer)', interests: ['medicine', 'teaching', 'law'], emoji: '🎓' },
      { label: 'Whatever starts earning soon', interests: ['business', 'hands-on', 'coding'], emoji: '💰' },
      { label: 'Whatever I choose, as long as I am serious', interests: ['research', 'design', 'media'], emoji: '🤝' },
    ],
  },
];

const TECHNICAL_QUESTIONS: InterestQuestion[] = [
  {
    id: 'tech-workshop',
    prompt: 'In the workshop or lab, what do you actually enjoy doing?',
    options: [
      { label: 'Wiring, circuits and machines that run', interests: ['hands-on', 'defence'], emoji: '⚡' },
      { label: 'Precision work — fitting, welding, machining', interests: ['hands-on'], emoji: '🔧' },
      { label: 'Reading drawings, CAD and measurements', interests: ['design', 'hands-on'], emoji: '📐' },
      { label: 'Software, systems and programming tasks', interests: ['coding'], emoji: '💻' },
    ],
  },
  {
    id: 'tech-goal',
    prompt: 'What is the real goal after this course?',
    options: [
      { label: 'A technician job in a plant, railway or PSU', interests: ['hands-on', 'govt-service'], emoji: '🏭' },
      { label: 'An apprenticeship with a real company', interests: ['hands-on', 'business'], emoji: '🧰' },
      { label: 'Higher study — diploma to degree, or MCA-type route', interests: ['coding', 'research'], emoji: '🎓' },
      { label: 'My own workshop, service centre or contract work', interests: ['business', 'hands-on'], emoji: '🏪' },
    ],
  },
  {
    id: 'tech-sector',
    prompt: 'Government or private — where do you want the first five years?',
    options: [
      { label: 'Government: railway, PSU, electricity board', interests: ['govt-service', 'defence'], emoji: '🏛️' },
      { label: 'A private company with visible promotions', interests: ['business', 'hands-on'], emoji: '📈' },
      { label: 'Freelance or contract work with my own clients', interests: ['business', 'design'], emoji: '🧾' },
      { label: 'Defence technical trades and uniformed service', interests: ['defence', 'hands-on'], emoji: '🎖️' },
    ],
  },
  {
    id: 'tech-subject',
    prompt: 'Which subject would you happily study one more year?',
    options: [
      { label: 'Maths and electrical/electronics theory', interests: ['research', 'coding'], emoji: '🔢' },
      { label: 'Machines, materials and production', interests: ['hands-on'], emoji: '⚙️' },
      { label: 'Computer applications and IT tools', interests: ['coding'], emoji: '🖥️' },
      { label: 'Management, costing and accounts', interests: ['business'], emoji: '📊' },
    ],
  },
  {
    id: 'tech-place',
    prompt: 'Where do you want to work and live?',
    options: [
      { label: 'A plant or site near home', interests: ['hands-on', 'agriculture'], emoji: '🏠' },
      { label: 'Railway/PSU/defence workshops anywhere in India', interests: ['defence', 'govt-service'], emoji: '🚆' },
      { label: 'An IT or design office after upskilling', interests: ['coding', 'design'], emoji: '🖥️' },
      { label: 'Field work in energy, agriculture or infrastructure', interests: ['agriculture', 'hands-on'], emoji: '🌾' },
    ],
  },
];

const DEGREE_QUESTIONS: InterestQuestion[] = [
  {
    id: 'deg-firstjob',
    prompt: 'Two years left. Which line do you want your first job to be in?',
    options: [
      { label: 'Software, product or IT services', interests: ['coding'], emoji: '💻' },
      { label: 'Core engineering, plant and operations', interests: ['hands-on'], emoji: '🏭' },
      { label: 'Analytics, finance, banking or consulting', interests: ['business', 'research'], emoji: '📈' },
      { label: 'Healthcare, life sciences or lab work', interests: ['medicine', 'research'], emoji: '🩺' },
    ],
  },
  {
    id: 'deg-strength',
    prompt: 'Which skill do you already enjoy enough to build proof in public?',
    options: [
      { label: 'Building and shipping projects or apps', interests: ['coding', 'design'], emoji: '🚀' },
      { label: 'Solving data and puzzle problems', interests: ['research', 'coding'], emoji: '🧩' },
      { label: 'Presenting, selling and leading a team', interests: ['business', 'media'], emoji: '🗣️' },
      { label: 'Designing things people actually use', interests: ['design'], emoji: '🎨' },
    ],
  },
  {
    id: 'deg-plan',
    prompt: 'What is the plan right after the degree?',
    options: [
      { label: 'Campus or off-campus placement', interests: ['coding', 'business'], emoji: '💼' },
      { label: 'Government exams — SSC, banking, PSU, state PSC', interests: ['govt-service'], emoji: '🏛️' },
      { label: 'Higher study — M.Tech, MBA, MCA or M.Sc', interests: ['research', 'business'], emoji: '🎓' },
      { label: 'Starting something of my own', interests: ['business', 'design'], emoji: '💡' },
    ],
  },
  {
    id: 'deg-workfeel',
    prompt: 'How should the daily work feel?',
    options: [
      { label: 'Deep focus, few meetings, technical depth', interests: ['coding', 'research'], emoji: '🎧' },
      { label: 'Fast, varied, people-facing', interests: ['business', 'media'], emoji: '⚡' },
      { label: 'Structured systems with clear rules', interests: ['govt-service', 'research'], emoji: '📋' },
      { label: 'Creative freedom with deadlines', interests: ['design', 'media'], emoji: '🎬' },
    ],
  },
  {
    id: 'deg-internship',
    prompt: 'Which internship would teach you the most right now?',
    options: [
      { label: 'Product or software development', interests: ['coding'], emoji: '🧑‍💻' },
      { label: 'Operations, plant or site work', interests: ['hands-on'], emoji: '🏗️' },
      { label: 'Marketing, HR or business development', interests: ['business', 'media'], emoji: '📣' },
      { label: 'Research lab or healthcare project', interests: ['research', 'medicine'], emoji: '🔬' },
    ],
  },
];

const MEDICAL_QUESTIONS: InterestQuestion[] = [
  {
    id: 'med-clinical',
    prompt: 'In clinical postings, what actually engages you?',
    options: [
      { label: 'Direct patient care, history-taking and diagnosis', interests: ['medicine'], emoji: '🩺' },
      { label: 'Procedures, surgery and hands-on skills', interests: ['medicine', 'hands-on'], emoji: '🔪' },
      { label: 'Labs, pathology and reading scans', interests: ['research', 'medicine'], emoji: '🔬' },
      { label: 'Camps, community health and public programmes', interests: ['medicine', 'govt-service'], emoji: '🚑' },
    ],
  },
  {
    id: 'med-after',
    prompt: 'What is your honest plan after the degree and internship?',
    options: [
      { label: 'PG entrance — MD/MS in a clinical branch', interests: ['medicine', 'research'], emoji: '🎯' },
      { label: 'Government service — CMS, state medical officer', interests: ['govt-service', 'medicine'], emoji: '🏛️' },
      { label: 'Nursing officer or paramedical government post', interests: ['govt-service', 'medicine'], emoji: '🏥' },
      { label: 'Allied route — MPH, hospital administration, research', interests: ['research', 'business'], emoji: '📊' },
    ],
  },
  {
    id: 'med-nonclinical',
    prompt: 'Which non-clinical work would you still enjoy doing daily?',
    options: [
      { label: 'Teaching students, residents and nurses', interests: ['teaching', 'medicine'], emoji: '🧑‍🏫' },
      { label: 'Running hospital operations and administration', interests: ['business', 'govt-service'], emoji: '📋' },
      { label: 'Clinical trials, data and drug research', interests: ['research', 'business'], emoji: '🧪' },
      { label: 'Health policy, insurance and public schemes', interests: ['govt-service', 'law'], emoji: '📜' },
    ],
  },
  {
    id: 'med-priority',
    prompt: 'When the work gets hard, what keeps you going?',
    options: [
      { label: 'Saving lives, even at the cost of my own time', interests: ['medicine'], emoji: '❤️' },
      { label: 'Job security and time with my family', interests: ['govt-service', 'teaching'], emoji: '🛡️' },
      { label: 'A high income through specialisation or practice', interests: ['medicine', 'business'], emoji: '💰' },
      { label: 'Research recognition, papers and answers', interests: ['research', 'teaching'], emoji: '📚' },
    ],
  },
  {
    id: 'med-ten',
    prompt: 'Ten years from now, where do you want to be working?',
    options: [
      { label: 'A government hospital or medical college', interests: ['govt-service', 'teaching', 'medicine'], emoji: '🏥' },
      { label: 'A private hospital or my own clinic', interests: ['medicine', 'business'], emoji: '🏪' },
      { label: 'A research institute or global health body', interests: ['research', 'govt-service'], emoji: '🌍' },
      { label: 'A pharma, health-tech or health NGO leadership role', interests: ['business', 'research'], emoji: '💊' },
    ],
  },
];

const GRADUATE_QUESTIONS: InterestQuestion[] = [
  {
    id: 'grad-target',
    prompt: 'You need a first job. Which target feels both realistic and right?',
    options: [
      { label: 'IT services, support or operations roles', interests: ['coding', 'business'], emoji: '🖥️' },
      { label: 'Accounts, finance, banking and insurance', interests: ['business', 'govt-service'], emoji: '🏦' },
      { label: 'Government exams — SSC CGL, banking, state PSC', interests: ['govt-service'], emoji: '🏛️' },
      { label: 'Teaching, content, media or design work', interests: ['teaching', 'media', 'design'], emoji: '🎙️' },
    ],
  },
  {
    id: 'grad-skill',
    prompt: 'Which skill could you build in 12 weeks to change your hiring pool?',
    options: [
      { label: 'Data analysis — Python, SQL, spreadsheets', interests: ['coding', 'research'], emoji: '📊' },
      { label: 'Digital marketing, content and social media', interests: ['media', 'design'], emoji: '📣' },
      { label: 'Accounting tools — Tally, GST, advanced Excel', interests: ['business'], emoji: '🧾' },
      { label: 'Testing, cloud or full-stack development', interests: ['coding'], emoji: '☁️' },
    ],
  },
  {
    id: 'grad-env',
    prompt: 'Which working environment suits you now?',
    options: [
      { label: 'An office with targets and a clear promotion ladder', interests: ['business'], emoji: '📈' },
      { label: 'A government office with security and fixed hours', interests: ['govt-service'], emoji: '🛡️' },
      { label: 'Remote or project work with creative control', interests: ['design', 'media', 'coding'], emoji: '🌐' },
      { label: 'Field work with travel, clients and people', interests: ['business', 'agriculture'], emoji: '🚗' },
    ],
  },
  {
    id: 'grad-study',
    prompt: 'Be honest about more study.',
    options: [
      { label: 'Yes — but only a funded PG, never a paid private degree', interests: ['research'], emoji: '🎓' },
      { label: 'Yes — an MBA, but only if it raises my salary band', interests: ['business'], emoji: '📈' },
      { label: 'No — I want to start earning this year', interests: ['hands-on', 'business'], emoji: '⚡' },
      { label: 'Maybe after two years of real work experience', interests: ['research', 'business'], emoji: '⏳' },
    ],
  },
  {
    id: 'grad-employer',
    prompt: 'Which employer do you want to end up with in five years?',
    options: [
      { label: 'Government or PSU, even if the process is slow', interests: ['govt-service'], emoji: '🏛️' },
      { label: 'A large private company with brand value', interests: ['business', 'coding'], emoji: '🏢' },
      { label: 'A small firm where I learn every function', interests: ['business', 'design'], emoji: '🔧' },
      { label: 'My own practice, agency, shop or farm', interests: ['business', 'agriculture'], emoji: '🏪' },
    ],
  },
];

const TEACHING_QUESTIONS: InterestQuestion[] = [
  {
    id: 'bed-students',
    prompt: 'Which students do you want to teach?',
    options: [
      { label: 'Primary children (Classes 1–5)', interests: ['teaching'], emoji: '🧸' },
      { label: 'Upper primary (Classes 6–8)', interests: ['teaching'], emoji: '📚' },
      { label: 'Secondary and senior secondary (9–12)', interests: ['teaching', 'research'], emoji: '🧑‍🏫' },
      { label: 'Adults, vocational trainees or coaching batches', interests: ['teaching', 'business'], emoji: '🎓' },
    ],
  },
  {
    id: 'bed-subject',
    prompt: 'Which subject is your real strength?',
    options: [
      { label: 'Maths and science', interests: ['research', 'teaching'], emoji: '🧮' },
      { label: 'Languages and social science', interests: ['law', 'media', 'teaching'], emoji: '📖' },
      { label: 'Commerce and computer applications', interests: ['business', 'coding'], emoji: '🖥️' },
      { label: 'Special education, art or physical education', interests: ['design', 'hands-on', 'medicine'], emoji: '🎨' },
    ],
  },
  {
    id: 'bed-where',
    prompt: 'Where do you want to teach?',
    options: [
      { label: 'A government school — KVS, NVS or state', interests: ['govt-service', 'teaching'], emoji: '🏛️' },
      { label: 'A private school with better pay, less security', interests: ['teaching', 'business'], emoji: '🏫' },
      { label: 'An ed-tech platform or online tutoring', interests: ['media', 'coding'], emoji: '💻' },
      { label: 'NGO, rural or community education programme', interests: ['teaching', 'govt-service'], emoji: '🤝' },
    ],
  },
  {
    id: 'bed-skill',
    prompt: 'Which extra skill would you like to build along with teaching?',
    options: [
      { label: 'Content, video lessons and storytelling', interests: ['media', 'design'], emoji: '🎬' },
      { label: 'Ed-tech tools and basic coding', interests: ['coding'], emoji: '⚙️' },
      { label: 'Counselling and child psychology', interests: ['teaching', 'medicine'], emoji: '🧠' },
      { label: 'School administration and management', interests: ['business', 'govt-service'], emoji: '📋' },
    ],
  },
  {
    id: 'bed-five',
    prompt: 'Five years from now, what do you want?',
    options: [
      { label: 'A permanent government teaching post', interests: ['govt-service', 'teaching'], emoji: '🛡️' },
      { label: 'A senior teacher or coordinator role', interests: ['teaching', 'business'], emoji: '📈' },
      { label: 'M.Ed now, lecturer and research later', interests: ['research', 'teaching'], emoji: '🔬' },
      { label: 'My own coaching institute', interests: ['business', 'teaching'], emoji: '🏫' },
    ],
  },
];

const POSTGRAD_QUESTIONS: InterestQuestion[] = [
  {
    id: 'pg-path',
    prompt: 'After the masters, which path do you actually want?',
    options: [
      { label: 'Lectureship / assistant professor through NET or SET', interests: ['teaching', 'research'], emoji: '🧑‍🏫' },
      { label: 'PhD and a full research career', interests: ['research', 'teaching'], emoji: '🔬' },
      { label: 'Industry roles inside my subject domain', interests: ['business', 'research'], emoji: '🏢' },
      { label: 'Government or PSU specialist posts', interests: ['govt-service'], emoji: '🏛️' },
    ],
  },
  {
    id: 'pg-leads',
    prompt: 'What does your subject naturally lead you towards?',
    options: [
      { label: 'Teaching and academics', interests: ['teaching', 'research'], emoji: '📚' },
      { label: 'Data, analytics and technology', interests: ['coding', 'research'], emoji: '📊' },
      { label: 'Management, finance and consulting', interests: ['business'], emoji: '📈' },
      { label: 'Policy, development and public systems', interests: ['govt-service', 'law'], emoji: '📜' },
    ],
  },
  {
    id: 'pg-work',
    prompt: 'Which work do you want more of in your week?',
    options: [
      { label: 'Reading, writing and publishing', interests: ['research', 'media'], emoji: '✍️' },
      { label: 'Building models, tools and experiments', interests: ['coding', 'research'], emoji: '🧪' },
      { label: 'Leading teams and taking decisions', interests: ['business'], emoji: '🧭' },
      { label: 'Training and mentoring people', interests: ['teaching'], emoji: '🤝' },
    ],
  },
  {
    id: 'pg-funding',
    prompt: 'What is the honest funding plan for the next three years?',
    options: [
      { label: 'JRF or fellowship — study while earning', interests: ['research', 'teaching'], emoji: '💠' },
      { label: 'A job first, research part-time', interests: ['business', 'research'], emoji: '🕒' },
      { label: 'Government service through an exam', interests: ['govt-service'], emoji: '🏛️' },
      { label: 'A corporate role with a much higher band', interests: ['business', 'coding'], emoji: '💼' },
    ],
  },
  {
    id: 'pg-employer',
    prompt: 'Which employer do you want five years from now?',
    options: [
      { label: 'A university or research institute', interests: ['teaching', 'research'], emoji: '🎓' },
      { label: 'A government department or PSU', interests: ['govt-service'], emoji: '🏛️' },
      { label: 'A private company in my domain', interests: ['business'], emoji: '🏢' },
      { label: 'An international organisation, NGO or think tank', interests: ['govt-service', 'research'], emoji: '🌍' },
    ],
  },
];

export const INTEREST_QUESTION_SETS: Record<InterestQuizGroup, InterestQuestion[]> = {
  school: SCHOOL_QUESTIONS,
  senior: SENIOR_QUESTIONS,
  technical: TECHNICAL_QUESTIONS,
  degree: DEGREE_QUESTIONS,
  graduate: GRADUATE_QUESTIONS,
  medical: MEDICAL_QUESTIONS,
  teaching: TEACHING_QUESTIONS,
  postgrad: POSTGRAD_QUESTIONS,
};

/** Default set when no stage is known yet — the broad school-level diagnostic. */
export const INTEREST_QUESTIONS: InterestQuestion[] = SCHOOL_QUESTIONS;

export function quizGroupFor(stage: string | '' | undefined): InterestQuizGroup {
  if (!stage) return 'school';
  return STAGE_QUIZ_GROUP[stage as QualificationId] ?? 'school';
}

/** The 5 questions this stage should actually be asked. */
export function interestQuestionsFor(stage: string | '' | undefined): InterestQuestion[] {
  return INTEREST_QUESTION_SETS[quizGroupFor(stage)];
}

/** Turn quiz answers into a weighted interest list (highest first). */
export function tallyInterests(
  answers: Record<string, number>,
  questions: InterestQuestion[] = INTEREST_QUESTIONS,
): string[] {
  const counts = new Map<string, number>();
  for (const question of questions) {
    const chosen = answers[question.id];
    if (chosen === undefined) continue;
    const option = question.options[chosen];
    if (!option) continue;
    for (const interest of option.interests) {
      counts.set(interest, (counts.get(interest) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([interest]) => interest);
}