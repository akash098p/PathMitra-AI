'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, Bell, ChevronRight, ChevronLeft, Heart, Share2, 
  Send, Sparkles, User, GraduationCap, Laptop, Wrench, 
  Compass, Scale, Map as MapIcon, Bot, BookOpen, 
  BarChart2, CheckCircle2, AlertCircle, ExternalLink,
  ShieldCheck, Briefcase, Landmark, Building2, TrendingUp,
  FileText, Award, HelpCircle, Layers, Users, ArrowUpRight
} from 'lucide-react';

// ==========================================
// REAL-TIME PAN-INDIA CAREER DATASETS
// ==========================================
const EXAM_DATABASE = [
  {
    id: 'jee',
    name: 'JEE Main & Advanced',
    eligibility: 'Class 12 (PCM) with 75% aggregate',
    scope: 'Admission to IITs, NITs, IIITs, & Centrally Funded Technical Institutes',
    target: '4-Year B.Tech / B.E.',
    category: 'National Engineering'
  },
  {
    id: 'neet',
    name: 'NEET-UG',
    eligibility: 'Class 12 (PCB) with Physics, Chemistry, Biology',
    scope: 'All Medical Colleges nationwide (AIIMS, State Medical Colleges)',
    target: 'MBBS, BDS, BAMS, BHMS',
    category: 'National Medical'
  },
  {
    id: 'cuet',
    name: 'CUET-UG (Common University Entrance)',
    eligibility: 'Class 12 (Any Stream)',
    scope: 'Central Universities (DU, BHU, JNU, Jamia, etc.)',
    target: 'B.Sc, BCA, BA, B.Com Honours',
    category: 'Central Universities'
  },
  {
    id: 'state-poly',
    name: 'Polytechnic Entrances (JEECUP / JEXPO / POLYCET)',
    eligibility: 'Class 10 Passed with Math & Physical Science',
    scope: 'Govt. & Private Polytechnic Institutes across States',
    target: '3-Year Polytechnic Engineering Diploma (Lateral Entry to B.Tech)',
    category: 'State Technical'
  },
  {
    id: 'nda',
    name: 'NDA / NA (UPSC Defence)',
    eligibility: 'Class 12 (PCM for Air Force/Navy, Any for Army) | Age 16.5 - 19.5',
    scope: 'Commissioned Officer in Army, Navy, or Air Force',
    target: 'Defence Services Officer + B.Tech/B.Sc Degree',
    category: 'Govt / Defence'
  },
  {
    id: 'ssc-chsl',
    name: 'SSC CHSL (10+2 Level)',
    eligibility: 'Class 12 Passed (Any Stream) | Age 18 - 27',
    scope: 'Ministries, Central Govt Offices (LDC, JSA, DEO)',
    target: 'Permanent Central Government Clerical Staff',
    category: 'Govt Public Sector'
  }
];

const PATHWAYS_DETAIL = {
  science: {
    title: 'Science Stream (PCM / PCMB)',
    duration: '2 Years (Class 11 & 12)',
    boardSyllabus: 'CBSE, ICSE, WBCHSE, Maharashtra State Board, etc.',
    coreSubjects: 'Physics, Chemistry, Mathematics, Optional: Computer Science / Biotech / English',
    approxCost: 'Govt Schools: ₹1,000 - ₹5,000/yr | Private: ₹40,000 - ₹1.5L/yr',
    govtJobs: 'NDA Officer, Indian Navy SSR, Indian Air Force Agniveer Vayu, SSC CHSL',
    privateJobs: 'Software Engineer, Data Scientist, Core R&D, Aerospace, Architecture',
    pros: 'Maximum career versatility; qualifies you for nearly every degree entrance exam in India.',
    cons: 'High competitive stress; demanding syllabus that often requires disciplined self-study or coaching.'
  },
  diploma: {
    title: 'Diploma in Computer / Technical Engineering',
    duration: '3 Years (6 Semesters after Class 10)',
    boardSyllabus: 'AICTE approved State Technical Boards (WBSCTE, BTEUP, MSBTE, DTE)',
    coreSubjects: 'Programming in C++/Python, Computer Networks, Operating Systems, Database Management, Digital Electronics',
    approxCost: 'Govt Polytechnic: ₹3,000 - ₹8,000/yr | Private: ₹30,000 - ₹70,000/yr',
    govtJobs: 'RRB Junior Engineer (Railways), SSC JE, State Electricity Boards, DRDO / ISRO Technician B',
    privateJobs: 'Junior Software Developer, Network Engineer, QA Tester, Field Systems Specialist',
    pros: 'Bypasses Class 11-12 rote science theory. Grants direct AICTE Lateral Entry into 2nd year B.Tech (JELET/LEET).',
    cons: 'Requires joining higher technical degree (B.Tech) later for executive/top-tier IT campus recruitment.'
  },
  iti: {
    title: 'ITI / Craftsman Training Scheme',
    duration: '1 to 2 Years (After Class 10)',
    boardSyllabus: 'NCVT / SCVT Vocational Curriculum',
    coreSubjects: 'Computer Operator & Programming Assistant (COPA), Electrician, Fitter, Electronics Mechanic',
    approxCost: 'Govt ITI: Nominal (₹500 - ₹2,500/yr)',
    govtJobs: 'Indian Railways ALP (Assistant Loco Pilot), Ordnance Factories, BHEL, ONGC Apprentice',
    privateJobs: 'Hardware Support Tech, CNC Operator, Industrial Electrician, Telecom Field Engineer',
    pros: 'Fastest route to self-reliance, technical trade certification, and immediate apprentice stipends.',
    cons: 'Limited corporate software white-collar growth without subsequent polytechnic or university qualifications.'
  },
  other: {
    title: 'Commerce with Computer Applications / Arts',
    duration: '2 Years (Class 11 & 12)',
    boardSyllabus: 'Accountancy, Business Studies, Economics, Informatics Practices (IP) or Mathematics',
    coreSubjects: 'Applied Math, IP, SQL, Business Statistics, Web Design',
    approxCost: 'Govt: ₹2,000/yr | Private: ₹35,000 - ₹1.2L/yr',
    govtJobs: 'SSC CHSL, Banking Clerical & Probationary Officer (after BCA/B.Com), State Accounts Officer',
    privateJobs: 'Fintech Analyst, BCA to MCA Software Consultant, UI/UX Designer, Digital Marketing Strategist',
    pros: 'Balanced workload; enables direct entry into 3-year BCA (Bachelor of Computer Applications).',
    cons: 'Ineligible for regular engineering colleges that mandate Physics & Chemistry in Class 12.'
  }
};

export default function PathMitraApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'roadmap' | 'advisor' | 'resources' | 'profile'>('home');
  const [currentScreen, setCurrentScreen] = useState<'home' | 'options' | 'compare' | 'exams' | 'govtvsprivate'>('home');
  const [parentMode, setParentMode] = useState<boolean>(false);
  const [selectedPathwayKey, setSelectedPathwayKey] = useState<'science' | 'diploma' | 'iti' | 'other'>('science');

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { 
      sender: 'ai', 
      text: 'Namaste! I am PathMitra AI. Whether you are a student exploring career routes after Class 10 or a parent evaluating course fees and job stability, I am here to guide you. What question can I answer today?' 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || loading) return;

    setChatMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    if (!customPrompt) setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          educationStage: 'Class 10 Completed',
          goal: 'Explore Technology & Modern Careers',
          userState: 'All-India'
        })
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
    } catch {
      setChatMessages((prev) => [...prev, { sender: 'ai', text: 'Network connection issue. Please verify your connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-0 md:p-6 font-sans">
      {/* Centered Modern App Container */}
      <div className="relative w-full max-w-md h-[100dvh] md:h-[890px] bg-slate-50 md:rounded-3xl shadow-2xl overflow-hidden flex flex-col border-0 md:border border-slate-800">

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto pb-20 bg-[#F8FAFC]">

          {/* ========================================================
              TAB 1: HOME & DASHBOARD
          ========================================================= */}
          {activeTab === 'home' && currentScreen === 'home' && (
            <div className="p-4 space-y-4 animate-in fade-in duration-150">
              
              {/* Header */}
              <header className="flex items-center justify-between py-1">
                <button 
                  onClick={() => setParentMode(!parentMode)} 
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    parentMode ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{parentMode ? 'Parent View' : 'Student View'}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-sm font-extrabold tracking-tight text-slate-900 leading-none">
                      PATHMITRA <span className="text-indigo-600">AI</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-medium">Your AI Guide to Career</p>
                  </div>
                </div>

                <button className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl relative transition">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full"></span>
                </button>
              </header>

              {/* Persona Greeting Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3949AB] via-[#4338CA] to-[#5C6BC0] p-5 text-white shadow-xl shadow-indigo-100">
                <div className="relative z-10 max-w-[62%]">
                  <h2 className="text-xl font-bold flex items-center gap-1.5">
                    Hello Arjun <span className="text-base">👋</span>
                  </h2>
                  <div className="mt-3">
                    <span className="text-[10px] text-indigo-200 uppercase tracking-wider font-semibold">Education Stage</span>
                    <p className="text-xs font-semibold text-white">Class 10 Completed</p>
                  </div>
                  <div className="mt-2.5">
                    <span className="text-[10px] text-indigo-200 uppercase tracking-wider font-semibold">Goal</span>
                    <p className="text-xs font-bold text-white leading-snug">Explore Technology Careers</p>
                  </div>
                  {parentMode && (
                    <div className="mt-2 bg-white/20 px-2 py-1 rounded-md text-[10px] text-indigo-50">
                      👨‍👩‍👦 Financial & Job Stability Lens Active
                    </div>
                  )}
                </div>
                <div className="absolute right-2 bottom-0 w-32 h-36 flex items-end">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" 
                    alt="Arjun" 
                    className="w-28 h-28 object-cover rounded-2xl border-2 border-indigo-200/40 shadow-lg" 
                  />
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <div 
                  onClick={() => setCurrentScreen('options')}
                  className="cursor-pointer bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs hover:shadow-md transition flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-inner">
                      🧭
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">Explore Career Paths</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Discover streams after Class 10</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                </div>

                <div 
                  onClick={() => setCurrentScreen('compare')}
                  className="cursor-pointer bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs hover:shadow-md transition flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shadow-inner">
                      ⚖️
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">Compare Education Options</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Compare Science, Diploma, and ITI side-by-side</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                </div>
              </div>

              {/* Real-World Exploration Quick Tiles */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div 
                  onClick={() => setCurrentScreen('exams')}
                  className="cursor-pointer bg-white rounded-2xl p-3 border border-slate-100 shadow-xs hover:border-indigo-200 transition flex items-start space-x-2.5"
                >
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Award className="w-4 h-4" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Entrance Exams</h4>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">JEE, JEXPO, CUET, NDA</p>
                  </div>
                </div>

                <div 
                  onClick={() => setCurrentScreen('govtvsprivate')}
                  className="cursor-pointer bg-white rounded-2xl p-3 border border-slate-100 shadow-xs hover:border-indigo-200 transition flex items-start space-x-2.5"
                >
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Landmark className="w-4 h-4" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Govt vs Private</h4>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Jobs, exams & salary</p>
                  </div>
                </div>
              </div>

              {/* 2x2 Menu Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div 
                  onClick={() => setActiveTab('roadmap')}
                  className="cursor-pointer bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs hover:border-indigo-200 transition flex items-start space-x-3"
                >
                  <div className="text-2xl">🗺️</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">My Roadmap</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Class 10 to Career</p>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('advisor')}
                  className="cursor-pointer bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs hover:border-indigo-200 transition flex items-start space-x-3"
                >
                  <div className="text-2xl">🤖</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">AI Advisor</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Chat with AI Guide</p>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('resources')}
                  className="cursor-pointer bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs hover:border-indigo-200 transition flex items-start space-x-3"
                >
                  <div className="text-2xl">📖</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Resources</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Free courses & syllabi</p>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    handleSendMessage('Arjun wants a skill-gap analysis for software engineering careers. What should he learn right after Class 10?');
                    setActiveTab('advisor');
                  }}
                  className="cursor-pointer bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs hover:border-indigo-200 transition flex items-start space-x-3"
                >
                  <div className="text-2xl">📊</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Skill Analysis</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Find technical gaps</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              SCREEN: EXPLORE OPTIONS (4 QUADRANTS WITH DEEP DATA)
          ========================================================= */}
          {activeTab === 'home' && currentScreen === 'options' && (
            <div className="p-4 space-y-4 animate-in fade-in duration-150">
              <header className="flex items-center justify-between py-1">
                <button onClick={() => setCurrentScreen('home')} className="p-2 rounded-xl text-slate-700 hover:bg-slate-100">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold text-slate-900">Explore Your Options</h2>
                <button className="p-2 rounded-xl text-slate-700 hover:bg-slate-100">
                  <Heart className="w-5 h-5" />
                </button>
              </header>

              <div className="flex items-center justify-between px-2 pt-1 pb-1">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Your Interest</span>
                  <h3 className="text-2xl font-extrabold text-indigo-600 tracking-tight">Technology</h3>
                </div>
                <div className="text-3xl">🚀💻</div>
              </div>

              {/* 4 Pathway Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Science */}
                <div 
                  onClick={() => { setSelectedPathwayKey('science'); setCurrentScreen('compare'); }}
                  className="cursor-pointer bg-gradient-to-b from-[#F0FDF4] to-[#DCFCE7]/30 border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-emerald-300 transition"
                >
                  <div>
                    <div className="text-3xl mb-2">🧪</div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">Science Stream</h4>
                    <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">Class 11–12 with PCM. Engineering, research, and national entrance exams (JEE).</p>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-3">
                    View Details <span>→</span>
                  </span>
                </div>

                {/* Diploma */}
                <div 
                  onClick={() => { setSelectedPathwayKey('diploma'); setCurrentScreen('compare'); }}
                  className="cursor-pointer bg-gradient-to-b from-[#EFF6FF] to-[#DBEAFE]/30 border border-blue-100 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-blue-300 transition"
                >
                  <div>
                    <div className="text-3xl mb-2">💻</div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">Diploma in Computer Engineering</h4>
                    <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">3-Year polytechnic. Direct industry skills with lateral entry into B.Tech Year 2.</p>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-3">
                    View Details <span>→</span>
                  </span>
                </div>

                {/* ITI */}
                <div 
                  onClick={() => { setSelectedPathwayKey('iti'); setCurrentScreen('compare'); }}
                  className="cursor-pointer bg-gradient-to-b from-[#FFFBEB] to-[#FEF3C7]/30 border border-amber-100 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-amber-300 transition"
                >
                  <div>
                    <div className="text-3xl mb-2">🛠️</div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">ITI / Vocational</h4>
                    <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">Short-term technical courses with fast railway/PSU apprentice opportunities.</p>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-3">
                    View Details <span>→</span>
                  </span>
                </div>

                {/* Other */}
                <div 
                  onClick={() => { setSelectedPathwayKey('other'); setCurrentScreen('compare'); }}
                  className="cursor-pointer bg-gradient-to-b from-[#FFF1F2] to-[#FFE4E6]/30 border border-rose-100 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-rose-300 transition"
                >
                  <div>
                    <div className="text-3xl mb-2">🔀</div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">Other Paths</h4>
                    <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">Commerce with IP, BCA degree route, UI/UX Design, and emerging digital fields.</p>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-3">
                    View Details <span>→</span>
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setCurrentScreen('compare')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-100 transition flex items-center justify-center space-x-2 text-xs"
              >
                <span>Compare Selected Options</span>
              </button>

              <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between space-x-3">
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                    <span>✨</span> AI Insight
                  </h5>
                  <p className="text-[10px] text-indigo-800 leading-relaxed">
                    If Arjun prefers early practical coding without 2 years of chemistry, Polytechnic Diploma is the strongest alternative to Science PCM.
                  </p>
                </div>
                <div className="w-14 h-14 bg-white rounded-2xl shadow-xs border border-indigo-100 flex items-center justify-center text-3xl flex-shrink-0">
                  🤖
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              SCREEN: ALL-INDIA ENTRANCE EXAM TRACKER
          ========================================================= */}
          {activeTab === 'home' && currentScreen === 'exams' && (
            <div className="p-4 space-y-4 animate-in fade-in duration-150">
              <header className="flex items-center justify-between py-1">
                <button onClick={() => setCurrentScreen('home')} className="p-2 rounded-xl text-slate-700 hover:bg-slate-100">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold text-slate-900">National & State Exams</h2>
                <div className="w-8"></div>
              </header>

              <div className="space-y-3">
                {EXAM_DATABASE.map((exam) => (
                  <div key={exam.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">
                        {exam.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{exam.target}</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">{exam.name}</h3>
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <p><strong className="text-slate-700">Eligibility:</strong> {exam.eligibility}</p>
                      <p><strong className="text-slate-700">Admission Scope:</strong> {exam.scope}</p>
                    </div>
                    <button 
                      onClick={() => {
                        handleSendMessage(`Explain preparation strategy and syllabus for ${exam.name} for a student in Class 10.`);
                        setActiveTab('advisor');
                      }}
                      className="w-full mt-2 py-2 bg-slate-50 hover:bg-indigo-50 text-indigo-600 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1"
                    >
                      <span>Ask AI Study Plan for {exam.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              SCREEN: GOVT VS PRIVATE SECTOR COMPARISON
          ========================================================= */}
          {activeTab === 'home' && currentScreen === 'govtvsprivate' && (
            <div className="p-4 space-y-4 animate-in fade-in duration-150">
              <header className="flex items-center justify-between py-1">
                <button onClick={() => setCurrentScreen('home')} className="p-2 rounded-xl text-slate-700 hover:bg-slate-100">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold text-slate-900">Govt vs Private Opportunities</h2>
                <div className="w-8"></div>
              </header>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <Landmark className="w-4 h-4 text-emerald-600" />
                    <span>Government Sector</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    High job security, pension/PF benefits, fixed work hours, and social prestige.
                  </p>
                  <div className="space-y-1 text-[10px] pt-1">
                    <p><strong>After 10th:</strong> SSC MTS, Railways Group D, Navy MR</p>
                    <p><strong>After 12th:</strong> NDA, SSC CHSL (LDC/DEO), Coast Guard</p>
                    <p><strong>After Diploma:</strong> RRB JE (Railways), SSC JE, State DISCOMs</p>
                    <p><strong>Entry Salary:</strong> ₹22,000 - ₹55,000/month</p>
                  </div>
                </div>

                <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Private / Tech Industry</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    High salary ceiling, performance-based promotions, and international mobility.
                  </p>
                  <div className="space-y-1 text-[10px] pt-1">
                    <p><strong>Roles:</strong> Fullstack Developer, AI/Data Engineer, Cloud Architect</p>
                    <p><strong>Hiring Criteria:</strong> Practical project portfolio, LeetCode, GitHub</p>
                    <p><strong>Starter Packages:</strong> ₹3.5 LPA (Mass IT) to ₹20+ LPA (Product Firms)</p>
                    <p><strong>5-Year Potential:</strong> ₹18 LPA - ₹45+ LPA</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>The Hybrid Path (Recommended by PathMitra)</span>
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Students do not have to choose strictly between government and corporate careers at age 16. Earning a technical degree (B.Tech or BCA) leaves both doors open: you remain eligible for PSU/GATE/UPSC jobs while continuing to interview for private tech companies.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================
              SCREEN: DETAILED PATHWAY MATRIX (PARENTS & STUDENTS)
          ========================================================= */}
          {activeTab === 'home' && currentScreen === 'compare' && (
            <div className="p-4 space-y-4 animate-in fade-in duration-150">
              <header className="flex items-center justify-between py-1">
                <button onClick={() => setCurrentScreen('options')} className="p-2 rounded-xl text-slate-700 hover:bg-slate-100">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold text-slate-900">Pathway Comparison Matrix</h2>
                <div className="w-8"></div>
              </header>

              {/* Selector Tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {(['science', 'diploma', 'iti', 'other'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPathwayKey(key)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition ${
                      selectedPathwayKey === key ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    {key === 'science' && 'Science PCM'}
                    {key === 'diploma' && 'Polytechnic Diploma'}
                    {key === 'iti' && 'ITI Vocational'}
                    {key === 'other' && 'Commerce / Other'}
                  </button>
                ))}
              </div>

              {/* Matrix Card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Course Details</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{PATHWAYS_DETAIL[selectedPathwayKey].title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{PATHWAYS_DETAIL[selectedPathwayKey].duration}</p>
                </div>

                <div className="divide-y divide-slate-100 space-y-2 pt-1">
                  <div className="pt-2">
                    <strong className="text-slate-800 block text-[11px]">Syllabus & Curriculum</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">{PATHWAYS_DETAIL[selectedPathwayKey].coreSubjects}</p>
                  </div>

                  <div className="pt-2">
                    <strong className="text-slate-800 block text-[11px]">Estimated Education Costs</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">{PATHWAYS_DETAIL[selectedPathwayKey].approxCost}</p>
                  </div>

                  <div className="pt-2">
                    <strong className="text-slate-800 block text-[11px]">Government Job Eligibility</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">{PATHWAYS_DETAIL[selectedPathwayKey].govtJobs}</p>
                  </div>

                  <div className="pt-2">
                    <strong className="text-slate-800 block text-[11px]">Private Industry Scope</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">{PATHWAYS_DETAIL[selectedPathwayKey].privateJobs}</p>
                  </div>

                  <div className="pt-2">
                    <span className="text-emerald-700 font-bold block text-[11px]">Key Advantage</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">{PATHWAYS_DETAIL[selectedPathwayKey].pros}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => setActiveTab('roadmap')}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>Generate Career Roadmap</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    handleSendMessage(`Compare Science PCM with Polytechnic Diploma from a financial and time-to-employment perspective.`);
                    setActiveTab('advisor');
                  }}
                  className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 flex items-center gap-1"
                >
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>Discuss</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: CAREER ROADMAP
          ========================================================= */}
          {activeTab === 'roadmap' && (
            <div className="p-4 space-y-4 animate-in fade-in duration-150">
              <header className="flex items-center justify-between py-1">
                <button onClick={() => setActiveTab('home')} className="p-2 rounded-xl text-slate-700 hover:bg-slate-100">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold text-slate-900">My AI Career Roadmap</h2>
                <button className="p-2 rounded-xl text-slate-700 hover:bg-slate-100">
                  <Share2 className="w-5 h-5" />
                </button>
              </header>

              <div className="rounded-2xl bg-gradient-to-r from-[#312E81] to-[#4338CA] p-3.5 text-white flex items-center space-x-3 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
                  🎯
                </div>
                <div>
                  <p className="text-[10px] text-indigo-200 uppercase tracking-wider font-semibold">Goal</p>
                  <h3 className="text-sm font-bold text-white">Technology Career</h3>
                </div>
              </div>

              {/* 6 Step Vertical Timeline */}
              <div className="relative space-y-3 pl-1 pt-1">
                <div className="absolute left-4 top-4 bottom-4 w-0.5 border-l-2 border-dashed border-slate-300"></div>

                <div className="relative flex items-center space-x-3 z-10 bg-white rounded-2xl p-3 border border-slate-100 shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">1</div>
                  <div className="flex-1 pr-1">
                    <h4 className="text-xs font-bold text-slate-900">Choose Education Path</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">Select between Science PCM or 3-Year Polytechnic Diploma.</p>
                  </div>
                  <div className="text-lg">🎓</div>
                </div>

                <div className="relative flex items-center space-x-3 z-10 bg-white rounded-2xl p-3 border border-slate-100 shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">2</div>
                  <div className="flex-1 pr-1">
                    <h4 className="text-xs font-bold text-slate-900">Build Foundation Skills</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">Improve Mathematics, Logic, English and basic computer skills.</p>
                  </div>
                  <div className="text-lg">📖</div>
                </div>

                <div className="relative flex items-center space-x-3 z-10 bg-white rounded-2xl p-3 border border-slate-100 shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">3</div>
                  <div className="flex-1 pr-1">
                    <h4 className="text-xs font-bold text-slate-900">Learn Programming / Core Skills</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">Learn languages like Python, HTML, CSS, and basic algorithms.</p>
                  </div>
                  <div className="text-lg">💻</div>
                </div>

                <div className="relative flex items-center space-x-3 z-10 bg-white rounded-2xl p-3 border border-slate-100 shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">4</div>
                  <div className="flex-1 pr-1">
                    <h4 className="text-xs font-bold text-slate-900">Build Projects</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">Build practical projects to strengthen your GitHub portfolio.</p>
                  </div>
                  <div className="text-lg">📁</div>
                </div>

                <div className="relative flex items-center space-x-3 z-10 bg-white rounded-2xl p-3 border border-slate-100 shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-pink-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">5</div>
                  <div className="flex-1 pr-1">
                    <h4 className="text-xs font-bold text-slate-900">Higher Education / Training</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">Pursue B.Tech degree (regular or lateral entry) or BCA.</p>
                  </div>
                  <div className="text-lg">🏛️</div>
                </div>

                <div className="relative flex items-center space-x-3 z-10 bg-white rounded-2xl p-3 border border-slate-100 shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">6</div>
                  <div className="flex-1 pr-1">
                    <h4 className="text-xs font-bold text-slate-900">Internship & Career Preparation</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">Gain experience, prepare for placements and public service exams.</p>
                  </div>
                  <div className="text-lg">💼</div>
                </div>
              </div>

              {/* Sub-Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={() => setActiveTab('resources')}
                  className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-2xl p-3 flex items-center space-x-2.5 transition"
                >
                  <span className="text-xl">📚</span>
                  <span className="text-[11px] font-bold text-indigo-950 leading-tight text-left">Recommended Resources</span>
                </button>
                <button 
                  onClick={() => setActiveTab('advisor')}
                  className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-2xl p-3 flex items-center space-x-2.5 transition"
                >
                  <span className="text-xl">🤖</span>
                  <span className="text-[11px] font-bold text-indigo-950 leading-tight text-left">Ask AI Advisor</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: AI ADVISOR (EXPERT PAN-INDIA CHAT)
          ========================================================= */}
          {activeTab === 'advisor' && (
            <div className="p-4 flex flex-col h-full space-y-3 animate-in fade-in duration-150">
              <header className="flex items-center justify-between py-1 border-b border-slate-100 pb-2">
                <button onClick={() => setActiveTab('home')} className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900">PathMitra AI Senior Advisor</h2>
                    <p className="text-[9px] text-emerald-600 font-semibold">Pan-India Knowledge Base Ready</p>
                  </div>
                </div>
                <div className="w-8"></div>
              </header>

              {/* Quick Prompt Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px]">
                <button 
                  onClick={() => handleSendMessage('Can I do B.Tech without JEE if I take a 3-year Polytechnic diploma?')}
                  className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap hover:bg-indigo-50 hover:border-indigo-200"
                >
                  Polytechnic Lateral Entry?
                </button>
                <button 
                  onClick={() => handleSendMessage('What are the best government jobs for students after Class 10 and 12?')}
                  className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap hover:bg-indigo-50 hover:border-indigo-200"
                >
                  Govt Exams after 10th/12th?
                </button>
                <button 
                  onClick={() => handleSendMessage('What is the realistic fee and starting salary difference between Science PCM and Polytechnic?')}
                  className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap hover:bg-indigo-50 hover:border-indigo-200"
                >
                  Parents Guide: Fees & Salary?
                </button>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs whitespace-pre-line leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-xs' 
                        : 'bg-white border border-slate-200 text-slate-800 shadow-xs rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-400 flex items-center space-x-1.5 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                      <span>PathMitra is researching academic & job pathways...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about boards, state CETs, polytechnic, or NDA..." 
                  className="flex-1 bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-600"
                />
                <button 
                  onClick={() => handleSendMessage()} 
                  disabled={loading}
                  className="p-2.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: CURATED PAN-INDIA RESOURCES
          ========================================================= */}
          {activeTab === 'resources' && (
            <div className="p-4 space-y-4 animate-in fade-in duration-150">
              <header className="flex items-center justify-between py-1">
                <button onClick={() => setActiveTab('home')} className="p-2 rounded-xl text-slate-700 hover:bg-slate-100">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold text-slate-900">Recommended Resources</h2>
                <div className="w-8"></div>
              </header>

              <div className="space-y-3">
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-start space-x-3.5">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xl">💻</div>
                  <div className="flex-1">
                    <span className="text-[9px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Free Coding Track</span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">CS50: Introduction to Computer Science</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Harvard's open course covering C, Python, algorithms, and computational thinking.</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-start space-x-3.5">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xl">📚</div>
                  <div className="flex-1">
                    <span className="text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Govt SWAYAM / NPTEL</span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">Ministry of Education Free IIT Courses</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">High-quality government portal offering direct IIT faculty certifications across technical subjects.</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-start space-x-3.5">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl text-xl">🛠️</div>
                  <div className="flex-1">
                    <span className="text-[9px] font-bold uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">Open Projects</span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">freeCodeCamp Responsive Web Design</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Learn HTML5/CSS and build 5 practical portfolio projects to showcase skills to recruiters.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: STUDENT & PARENT PROFILE
          ========================================================= */}
          {activeTab === 'profile' && (
            <div className="p-4 space-y-4 animate-in fade-in duration-150">
              <header className="flex items-center justify-between py-1">
                <button onClick={() => setActiveTab('home')} className="p-2 rounded-xl text-slate-700 hover:bg-slate-100">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold text-slate-900">Student & Family Profile</h2>
                <div className="w-8"></div>
              </header>

              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center space-x-4">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" 
                  alt="Arjun" 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Arjun Sharma</h3>
                  <p className="text-xs text-slate-500">Kolkata, West Bengal</p>
                  <span className="inline-block mt-1 text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md">
                    Class 10 Passed (WBBSE / CBSE)
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Academic & Preference Mapping</h4>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Key Interests</span>
                    <span className="font-semibold text-slate-800">Computers, Math, Electronics</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Target Role</span>
                    <span className="font-semibold text-indigo-600">Software / Technical Engineering</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Current Milestone</span>
                    <span className="font-semibold text-emerald-600">Step 1: Choose Stream vs Polytechnic</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* ========================================================
            BOTTOM APP BAR (EXACT 5 TABS MATCHING DESIGN)
        ========================================================= */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-2 flex justify-between items-center z-40">
          <button 
            onClick={() => { setActiveTab('home'); setCurrentScreen('home'); }}
            className={`flex flex-col items-center flex-1 transition ${activeTab === 'home' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          <button 
            onClick={() => setActiveTab('roadmap')}
            className={`flex flex-col items-center flex-1 transition ${activeTab === 'roadmap' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
          >
            <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.284a2.25 2.25 0 00-2.012 0L2.616 5.722A1.125 1.125 0 002 6.728v11.664c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/></svg>
            <span className="text-[10px] mt-0.5">Roadmap</span>
          </button>

          <button 
            onClick={() => setActiveTab('advisor')}
            className={`flex flex-col items-center flex-1 transition ${activeTab === 'advisor' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
          >
            <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>
            <span className="text-[10px] mt-0.5">Advisor</span>
          </button>

          <button 
            onClick={() => setActiveTab('resources')}
            className={`flex flex-col items-center flex-1 transition ${activeTab === 'resources' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
          >
            <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
            <span className="text-[10px] mt-0.5">Resources</span>
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center flex-1 transition ${activeTab === 'profile' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
          >
            <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
            <span className="text-[10px] mt-0.5">Profile</span>
          </button>
        </nav>

      </div>
    </div>
  );
}