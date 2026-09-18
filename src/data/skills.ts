import type { SkillTrack } from '@/lib/types';

// ============================================================================
// Skill tracks — what a student can start learning *right now*, without a
// degree. Each track lists honest milestones, first projects and free
// resources, because skill is the one asset no entrance exam can take away.
// ============================================================================

export const SKILL_TRACKS: SkillTrack[] = [
  {
    id: 'web-dev',
    name: 'Web Development',
    emoji: '🌐',
    fits: ['coding', 'design'],
    weeklyHours: '8–10 hours per week',
    timeToFirstProject: '6–10 weeks to a live personal site',
    milestones: [
      'HTML and CSS — build and style three static pages by hand',
      'JavaScript basics — variables, functions, arrays, DOM events',
      'Git and GitHub — commit, branch, and publish code publicly',
      'One front-end framework (React or Next.js) at component level',
      'Basic API calls and JSON handling',
      'Deploy free on Vercel or Netlify and share a live link',
    ],
    beginnerProjects: [
      'Personal portfolio page with your marksheets, projects and contact form',
      'Class-timetable or attendance tracker that saves data in the browser',
      'Small expense tracker for your family with a monthly summary chart',
      'A quiz app on your favourite subject with instant scoring',
    ],
    resources: [
      { label: 'freeCodeCamp — Responsive Web Design', url: 'https://www.freecodecamp.org' },
      { label: 'MDN Web Docs (the reference)', url: 'https://developer.mozilla.org' },
      { label: 'Next.js Learn course', url: 'https://nextjs.org/learn' },
      { label: 'GitHub Skills', url: 'https://skills.github.com' },
    ],
    outcomeRoles: ['Web developer', 'Front-end intern', 'Freelance site builder for local shops'],
  },
  {
    id: 'python-data',
    name: 'Python & Data Skills',
    emoji: '🐍',
    fits: ['coding', 'research', 'business'],
    weeklyHours: '8–12 hours per week',
    timeToFirstProject: '8–12 weeks to your first data story',
    milestones: [
      'Python syntax — loops, functions, files, error handling',
      'Working with CSV and Excel data using pandas',
      'Basic statistics — mean, median, distribution, correlation',
      'Data visualisation with matplotlib and charts that explain a point',
      'Introductory SQL for querying databases',
      'One notebook that answers a real question about your city or school',
    ],
    beginnerProjects: [
      'Analysis of your school or locality electricity bills over a year',
      'Cricket or football statistics dashboard from free datasets',
      'Simple marks-prediction calculator based on study hours',
      'Automation script that renames and organises files or photos',
    ],
    resources: [
      { label: 'CS50P — Harvard Introduction to Programming with Python', url: 'https://cs50.harvard.edu/python' },
      { label: 'Kaggle Learn (free micro-courses)', url: 'https://www.kaggle.com/learn' },
      { label: 'Khan Academy — Statistics and Probability', url: 'https://www.khanacademy.org' },
    ],
    outcomeRoles: ['Data analyst intern', 'Python automation freelancer', 'Research assistant'],
  },
  {
    id: 'electronics-hardware',
    name: 'Electronics, Robotics & Hardware Repair',
    emoji: '🔌',
    fits: ['hands-on', 'coding', 'research'],
    weeklyHours: '6–8 hours per week',
    timeToFirstProject: '4–8 weeks to a working circuit',
    milestones: [
      'Basic components — resistors, capacitors, diodes, breadboard wiring',
      'Multimeter use, soldering practice and safe mains handling',
      'Arduino or ESP32 basics — sensors, LEDs, motors',
      'Reading circuit diagrams and datasheets',
      'Fault finding on a real appliance under supervision',
      'One IoT project that publishes sensor data online',
    ],
    beginnerProjects: [
      'Automatic street-light or water-tank level indicator',
      'Laptop and mobile repair practice on discarded devices',
      'Smart attendance or doorbell project with an ESP32',
      'Solar panel + battery charging setup for a study lamp',
    ],
    resources: [
      { label: 'NPTEL courses (free, IIT faculty)', url: 'https://nptel.ac.in' },
      { label: 'Arduino official tutorials', url: 'https://docs.arduino.cc/learn' },
      { label: 'SWAYAM free courses', url: 'https://swayam.gov.in' },
    ],
    outcomeRoles: ['Repair technician', 'Electronics apprentice', 'Automation technician'],
  },
  {
    id: 'design-ux',
    name: 'Design, Illustration & UI/UX',
    emoji: '🎨',
    fits: ['design', 'media'],
    weeklyHours: '6–10 hours per week',
    timeToFirstProject: '6–8 weeks to a shareable portfolio',
    milestones: [
      'Design fundamentals — layout, hierarchy, colour, typography',
      'One tool deeply: Figma for UI, or Illustrator / Krita for graphics',
      'Wireframing and turning a rough idea into clickable screens',
      'Basic user testing — show five people, note what confuses them',
      'Poster, thumbnail and social-media design practice every week',
      'A portfolio with at least three case studies and a short reason for each',
    ],
    beginnerProjects: [
      'Redesign the school notice board or a local shop menu',
      'Mobile app screens for a problem you face daily',
      'Event poster series for a school function',
      'Logo and social kit for a family business or NGO',
    ],
    resources: [
      { label: 'Figma free learning resources', url: 'https://www.figma.com/resource-library' },
      { label: 'Google Grow — UX design concepts', url: 'https://grow.google/certificates/ux-design' },
      { label: 'NPTEL — Design courses', url: 'https://nptel.ac.in' },
    ],
    outcomeRoles: ['Freelance designer', 'Social media designer', 'Junior UI/UX designer'],
  },
  {
    id: 'business-finance',
    name: 'Accounting, GST & Business Basics',
    emoji: '🧮',
    fits: ['business', 'govt-service'],
    weeklyHours: '6–8 hours per week',
    timeToFirstProject: '4–6 weeks to help a real small business',
    milestones: [
      'Book-keeping — ledgers, day book, trial balance',
      'Tally or a free accounting tool for real entries',
      'GST basics — registration, invoicing, return cycles',
      'Excel or Google Sheets — formulas, pivot tables, simple dashboards',
      'Reading a balance sheet and profit-and-loss statement',
      'Income-tax return filing basics for a salaried person',
    ],
    beginnerProjects: [
      'Maintain the books for a family shop for one month',
      'Build a monthly budget tracker for your household',
      'Prepare a small business plan with realistic cost and revenue estimates',
      'Create an invoice and GST-format bill template',
    ],
    resources: [
      { label: 'ICAI study material (free)', url: 'https://www.icai.org' },
      { label: 'GST portal — taxpayer resources', url: 'https://www.gst.gov.in' },
      { label: 'SWAYAM — commerce and accounting courses', url: 'https://swayam.gov.in' },
    ],
    outcomeRoles: ['Accounts assistant', 'Billing and data entry operator', 'CA article apprentice'],
  },
  {
    id: 'healthcare-skills',
    name: 'Healthcare & Care-Giving Basics',
    emoji: '🩹',
    fits: ['medicine', 'teaching'],
    weeklyHours: '5–8 hours per week',
    timeToFirstProject: '4–6 weeks to a certified first-aid skill',
    milestones: [
      'First aid and CPR certification from a recognised provider',
      'Human anatomy and physiology basics at Class 11–12 level',
      'Infection control, sterilisation and hospital hygiene practice',
      'Basic patient communication and empathy training',
      'Volunteering at a health camp or blood donation drive',
      'Emergency response — burns, fractures, snake bite, heat stroke',
    ],
    beginnerProjects: [
      'Organise a first-aid awareness session at your school',
      'Keep a volunteer log of hours at a local hospital or clinic',
      'Community health survey on sanitation or immunisation',
      'A simple health-data sheet tracking a village or ward camp',
    ],
    resources: [
      { label: 'National Health Mission resources', url: 'https://nhm.gov.in' },
      { label: 'Indian Red Cross Society training', url: 'https://www.indianredcross.org' },
      { label: 'NPTEL — Basic human physiology', url: 'https://nptel.ac.in' },
    ],
    outcomeRoles: ['Hospital volunteer', 'Home care attendant', 'Nursing assistant pathway'],
  },
  {
    id: 'communication-media',
    name: 'Communication, English & Content Creation',
    emoji: '🗣️',
    fits: ['media', 'law', 'teaching', 'govt-service'],
    weeklyHours: '5–8 hours per week',
    timeToFirstProject: '4–8 weeks to published work',
    milestones: [
      'Spoken English practice with structured daily speaking drills',
      'Writing clearly — summaries, letters, applications, short essays',
      'Presenting to an audience without reading from a script',
      'Video editing basics and clean audio recording',
      'Basic SEO and how search engines rank content',
      'Publishing consistently on one platform for three months',
    ],
    beginnerProjects: [
      'A weekly blog or channel on a subject you already know well',
      'Interview a local worker about their job and publish the story',
      'Make a two-minute explainer video on a school topic',
      'Draft a formal application or RTI request letter correctly',
    ],
    resources: [
      { label: 'SWAYAM — communication skills courses', url: 'https://swayam.gov.in' },
      { label: 'BBC Learning English (free)', url: 'https://www.bbc.co.uk/learningenglish' },
      { label: 'Google Digital Garage (free fundamentals)', url: 'https://learndigital.withgoogle.com' },
    ],
    outcomeRoles: ['Content writer', 'Customer support executive', 'Bilingual tutor'],
  },
  {
    id: 'govt-exam-prep',
    name: 'Government Exam Foundation',
    emoji: '🏛️',
    fits: ['govt-service', 'defence', 'law'],
    weeklyHours: '10–14 hours per week',
    timeToFirstProject: '6–12 months to first attempt readiness',
    milestones: [
      'Quantitative aptitude — percentages, ratios, averages, time and work',
      'Reasoning — series, coding-decoding, blood relations, seating arrangement',
      'General awareness — Indian polity, geography, and current affairs notes',
      'English comprehension and error spotting',
      'One full-length mock test every week with a written error log',
      'Physical preparation if targeting defence or police posts',
    ],
    beginnerProjects: [
      'A one-page daily current-affairs note file you actually revise',
      'Weekly mock test log with accuracy and speed tracked in a sheet',
      'Complete one past-year paper of SSC CHSL or a state constable exam',
      'Build a personal revision deck for polity and static GK',
    ],
    resources: [
      { label: 'SSC official portal (notices)', url: 'https://ssc.gov.in' },
      { label: 'UPSC official portal', url: 'https://upsc.gov.in' },
      { label: 'National Career Service', url: 'https://www.ncs.gov.in' },
    ],
    outcomeRoles: ['SSC CHSL / MTS aspirant', 'State police and defence aspirant', 'State PSC aspirant after graduation'],
  },
];

export function skillTracksForInterests(interests: string[]): SkillTrack[] {
  const scored = SKILL_TRACKS.map((track) => ({
    track,
    hits: track.fits.filter((f) => interests.includes(f)).length,
  }));
  const matched = scored.filter((s) => s.hits > 0).sort((a, b) => b.hits - a.hits);
  return (matched.length > 0 ? matched : scored).map((s) => s.track);
}
