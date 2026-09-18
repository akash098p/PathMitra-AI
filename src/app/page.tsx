'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, Bell, ChevronRight, ChevronLeft, Heart, Share2, 
  Send, Sparkles, User, GraduationCap, Laptop, Wrench, 
  Compass, Scale, Map as MapIcon, Bot, BookOpen, 
  BarChart2, CheckCircle2, AlertCircle, ExternalLink,
  Code, Award, ArrowUpRight
} from 'lucide-react';

export default function PathMitraApp() {
  // Navigation State mapped exactly to the 5 bottom buttons
  const [activeTab, setActiveTab] = useState<'home' | 'roadmap' | 'advisor' | 'resources' | 'profile'>('home');
  const [currentScreen, setCurrentScreen] = useState<'home' | 'options' | 'compare' | 'skills'>('home');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { 
      sender: 'ai', 
      text: 'Namaste Arjun! I am PathMitra AI. I can guide you through stream selection after Class 10, compare Polytechnic vs Science PCM, or recommend step-by-step career pathways. What would you like to explore?' 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;
    const userText = inputMessage;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          educationStage: 'Class 10 Completed',
          goal: 'Explore Technology Careers'
        })
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
    } catch {
      setChatMessages((prev) => [...prev, { sender: 'ai', text: 'Connection issue. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 md:p-6 font-sans">
      {/* Centered App Container */}
      <div className="relative w-full max-w-md h-[100dvh] md:h-[860px] bg-white md:rounded-3xl shadow-xl overflow-hidden flex flex-col border border-slate-200">

        {/* Scrollable Screen Content */}
        <main className="flex-1 overflow-y-auto pb-20 bg-[#F8FAFC]">

          {/* =========================================================
              VIEW 1: HOME TAB
          ========================================================== */}
          {activeTab === 'home' && currentScreen === 'home' && (
            <div className="p-4 space-y-4">
              {/* Header */}
              <header className="flex items-center justify-between py-1">
                <button className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition">
                  <Menu className="w-6 h-6" />
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
              <div className="space-y-3 pt-1">
                <div 
                  onClick={() => setCurrentScreen('options')}
                  className="cursor-pointer bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-inner">
                      🧭
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">Explore Career Paths</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Discover careers that match your interests and skills</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                </div>

                <div 
                  onClick={() => setCurrentScreen('compare')}
                  className="cursor-pointer bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shadow-inner">
                      ⚖️
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">Compare Education Options</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Compare different streams and courses</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                </div>
              </div>

              {/* 2x2 Feature Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div 
                  onClick={() => setActiveTab('roadmap')}
                  className="cursor-pointer bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm hover:border-indigo-200 transition flex items-start space-x-3"
                >
                  <div className="text-2xl">🗺️</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">My Roadmap</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">See your personalized career roadmap</p>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('advisor')}
                  className="cursor-pointer bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm hover:border-indigo-200 transition flex items-start space-x-3"
                >
                  <div className="text-2xl">🤖</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">AI Advisor</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Chat with AI for personal guidance</p>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('resources')}
                  className="cursor-pointer bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm hover:border-indigo-200 transition flex items-start space-x-3"
                >
                  <div className="text-2xl">📖</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Resources</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Explore courses, books and more</p>
                  </div>
                </div>

                <div 
                  onClick={() => setCurrentScreen('skills')}
                  className="cursor-pointer bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm hover:border-indigo-200 transition flex items-start space-x-3"
                >
                  <div className="text-2xl">📊</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Skill Analysis</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Analyze your skills and strengths</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 2: EXPLORE OPTIONS (4 QUADRANTS)
          ========================================================== */}
          {activeTab === 'home' && currentScreen === 'options' && (
            <div className="p-4 space-y-4">
              <header className="flex items-center justify-between py-1">
                <button onClick={() => setCurrentScreen('home')} className="p-2 rounded-xl text-slate-700 hover:bg-slate-100">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold text-slate-900">Explore Your Options</h2>
                <button className="p-2 rounded-xl text-slate-700 hover:bg-slate-100">
                  <Heart className="w-5 h-5" />
                </button>
              </header>

              <div className="flex items-center justify-between px-2 pt-1 pb-2">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Your Interest</span>
                  <h3 className="text-2xl font-extrabold text-indigo-600 tracking-tight">Technology</h3>
                </div>
                <div className="text-3xl">🚀💻</div>
              </div>

              {/* 4 Pathway Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-b from-[#F0FDF4] to-[#DCFCE7]/30 border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="text-3xl mb-2">🧪</div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">Science Stream</h4>
                    <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">Class 11–12 with PCM. Many career options including Engineering, Research, and more.</p>
                  </div>
                  <button onClick={() => setCurrentScreen('compare')} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-3">
                    View Details <span>→</span>
                  </button>
                </div>

                <div className="bg-gradient-to-b from-[#EFF6FF] to-[#DBEAFE]/30 border border-blue-100 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="text-3xl mb-2">💻</div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">Diploma in Computer Engineering</h4>
                    <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">3 Year Diploma. After 10th, learn technical skills and get industry ready.</p>
                  </div>
                  <button onClick={() => setCurrentScreen('compare')} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-3">
                    View Details <span>→</span>
                  </button>
                </div>

                <div className="bg-gradient-to-b from-[#FFFBEB] to-[#FEF3C7]/30 border border-amber-100 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="text-3xl mb-2">🛠️</div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">ITI / Vocational</h4>
                    <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">Short-term technical courses with fast employment opportunities.</p>
                  </div>
                  <button onClick={() => setCurrentScreen('compare')} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-3">
                    View Details <span>→</span>
                  </button>
                </div>

                <div className="bg-gradient-to-b from-[#FFF1F2] to-[#FFE4E6]/30 border border-rose-100 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="text-3xl mb-2">🔀</div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">Other Paths</h4>
                    <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">Commerce, Arts, Design, and other emerging fields.</p>
                  </div>
                  <button onClick={() => setCurrentScreen('compare')} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-3">
                    View Details <span>→</span>
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setCurrentScreen('compare')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-100 transition flex items-center justify-center space-x-2 text-xs"
              >
                <span>Compare Selected Options</span>
              </button>

              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between space-x-3">
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                    <span>✨</span> AI Insight
                  </h5>
                  <p className="text-[10px] text-indigo-800 leading-relaxed">
                    Here are the reasons each option may fit your profile. Tap "Compare" to see detailed analysis.
                  </p>
                </div>
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-center text-3xl flex-shrink-0">
                  🤖
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 3: COMPARISON SCREEN
          ========================================================== */}
          {activeTab === 'home' && currentScreen === 'compare' && (
            <div className="p-4 space-y-4">
              <header className="flex items-center justify-between py-1">
                <button onClick={() => setCurrentScreen('options')} className="p-2 rounded-xl text-slate-700 hover:bg-slate-100">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold text-slate-900">Compare Education Options</h2>
                <div className="w-8"></div>
              </header>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-3.5 bg-indigo-50/80 border-b border-indigo-100">
                  <h4 className="text-xs font-bold text-indigo-950">Science (PCM) vs. Polytechnic Diploma</h4>
                  <p className="text-[10px] text-slate-600 mt-0.5">Key differences for Class 10 graduates</p>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</span>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <strong className="text-slate-800 block text-[11px]">Science Stream</strong>
                        <span className="text-[10px] text-slate-600">2 Years (Class 11 & 12)</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <strong className="text-slate-800 block text-[11px]">Polytechnic CS</strong>
                        <span className="text-[10px] text-slate-600">3 Years (6 Semesters)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Learning Style</span>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <strong className="text-slate-800 block text-[11px]">Science Stream</strong>
                        <span className="text-[10px] text-slate-600">Theoretical: Physics, Chemistry & Pure Math.</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <strong className="text-slate-800 block text-[11px]">Polytechnic CS</strong>
                        <span className="text-[10px] text-slate-600">70% Practical: Coding, Circuits & Systems.</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">College Route</span>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <strong className="text-slate-800 block text-[11px]">Science Stream</strong>
                        <span className="text-[10px] text-slate-600">4-Yr B.Tech through JEE Main or State CETs.</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <strong className="text-slate-800 block text-[11px]">Polytechnic CS</strong>
                        <span className="text-[10px] text-slate-600">Direct 2nd Year Lateral Entry to B.Tech.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setActiveTab('roadmap')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-2xl shadow-md transition text-xs flex items-center justify-center gap-2"
              >
                <span>View Full Roadmap for this Option</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* =========================================================
              VIEW 4: SKILL ANALYSIS SCREEN
          ========================================================== */}
          {activeTab === 'home' && currentScreen === 'skills' && (
            <div className="p-4 space-y-4">
              <header className="flex items-center justify-between py-1">
                <button onClick={() => setCurrentScreen('home')} className="p-2 rounded-xl text-slate-700 hover:bg-slate-100">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold text-slate-900">Skill Analysis</h2>
                <div className="w-8"></div>
              </header>

              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Role Match</span>
                <div className="flex items-center justify-between mt-1">
                  <h3 className="text-sm font-bold text-slate-900">Entry-Level Software Developer</h3>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">45% Ready</span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '45%' }}></div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-emerald-50 text-emerald-800">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Math & Logic Reasoning</span>
                    <span className="font-semibold text-[10px]">Acquired</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-emerald-50 text-emerald-800">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Basic Computer Operations</span>
                    <span className="font-semibold text-[10px]">Acquired</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-amber-50 text-amber-900">
                    <span className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-amber-600" /> Python Programming</span>
                    <span className="font-semibold text-[10px]">Gap (High Priority)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-amber-50 text-amber-900">
                    <span className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-amber-600" /> Git & GitHub</span>
                    <span className="font-semibold text-[10px]">Gap</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-indigo-600 rounded-2xl text-white space-y-2 shadow-lg shadow-indigo-100">
                <h4 className="text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> AI Next Action Recommendation
                </h4>
                <p className="text-[11px] text-indigo-100 leading-relaxed">
                  Start with 15 minutes of interactive Python practice daily. Ask PathMitra AI in the Advisor tab for a beginner syllabus!
                </p>
                <button onClick={() => setActiveTab('advisor')} className="mt-2 bg-white text-indigo-900 text-[11px] font-bold px-3 py-2 rounded-xl">
                  Ask AI for Study Plan →
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 2: ROADMAP
          ========================================================== */}
          {activeTab === 'roadmap' && (
            <div className="p-4 space-y-4">
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

                <div className="relative flex items-center space-x-3 z-10 bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">1</div>
                  <div className="flex-1 pr-1">
                    <h4 className="text-xs font-bold text-slate-900">Choose Education Path</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">Select the right stream or diploma based on your interest.</p>
                  </div>
                  <div className="text-lg">🎓</div>
                </div>

                <div className="relative flex items-center space-x-3 z-10 bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">2</div>
                  <div className="flex-1 pr-1">
                    <h4 className="text-xs font-bold text-slate-900">Build Foundation Skills</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">Improve Mathematics, Logic, English and basic computer skills.</p>
                  </div>
                  <div className="text-lg">📖</div>
                </div>

                <div className="relative flex items-center space-x-3 z-10 bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">3</div>
                  <div className="flex-1 pr-1">
                    <h4 className="text-xs font-bold text-slate-900">Learn Programming / Core Skills</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">Learn languages like Python, HTML, CSS, and more.</p>
                  </div>
                  <div className="text-lg">💻</div>
                </div>

                <div className="relative flex items-center space-x-3 z-10 bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">4</div>
                  <div className="flex-1 pr-1">
                    <h4 className="text-xs font-bold text-slate-900">Build Projects</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">Build practical projects to strengthen your portfolio.</p>
                  </div>
                  <div className="text-lg">📁</div>
                </div>

                <div className="relative flex items-center space-x-3 z-10 bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-pink-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">5</div>
                  <div className="flex-1 pr-1">
                    <h4 className="text-xs font-bold text-slate-900">Higher Education / Training</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">Pursue degree, diploma or specialized courses.</p>
                  </div>
                  <div className="text-lg">🏛️</div>
                </div>

                <div className="relative flex items-center space-x-3 z-10 bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">6</div>
                  <div className="flex-1 pr-1">
                    <h4 className="text-xs font-bold text-slate-900">Internship & Career Preparation</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">Gain experience, prepare for placements and build your career.</p>
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

          {/* =========================================================
              TAB 3: AI ADVISOR CHAT
          ========================================================== */}
          {activeTab === 'advisor' && (
            <div className="p-4 flex flex-col h-full space-y-3">
              <header className="flex items-center justify-between py-1 border-b border-slate-100 pb-2">
                <button onClick={() => setActiveTab('home')} className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900">PathMitra AI Advisor</h2>
                    <p className="text-[9px] text-emerald-600 font-semibold">Ready to help</p>
                  </div>
                </div>
                <div className="w-8"></div>
              </header>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs whitespace-pre-line leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-400 flex items-center space-x-1.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                      <span>PathMitra is analyzing options...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about streams, polytechnic, coding..." 
                  className="flex-1 bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-600"
                />
                <button 
                  onClick={handleSendMessage} 
                  disabled={loading}
                  className="p-2.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 4: RESOURCES
          ========================================================== */}
          {activeTab === 'resources' && (
            <div className="p-4 space-y-4">
              <header className="flex items-center justify-between py-1">
                <button onClick={() => setActiveTab('home')} className="p-2 rounded-xl text-slate-700 hover:bg-slate-100">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold text-slate-900">Recommended Resources</h2>
                <div className="w-8"></div>
              </header>

              <div className="space-y-3">
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-start space-x-3.5">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xl">💻</div>
                  <div className="flex-1">
                    <span className="text-[9px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Free Beginner Course</span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">CS50P: Introduction to Programming with Python</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Harvard University's open course covering functions, loops, and logic.</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-start space-x-3.5">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xl">📚</div>
                  <div className="flex-1">
                    <span className="text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Mathematics Foundation</span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">Khan Academy: High School Algebra & Logic</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Build a foundation in discrete reasoning for software design.</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-start space-x-3.5">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl text-xl">🛠️</div>
                  <div className="flex-1">
                    <span className="text-[9px] font-bold uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">Hands-On Practice</span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">freeCodeCamp: Responsive Web Design</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Learn HTML, CSS, and interactive design to build your first portfolio project.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 5: PROFILE
          ========================================================== */}
          {activeTab === 'profile' && (
            <div className="p-4 space-y-4">
              <header className="flex items-center justify-between py-1">
                <button onClick={() => setActiveTab('home')} className="p-2 rounded-xl text-slate-700 hover:bg-slate-100">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold text-slate-900">Student Profile</h2>
                <div className="w-8"></div>
              </header>

              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center space-x-4">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" 
                  alt="Arjun" 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Arjun Sharma</h3>
                  <p className="text-xs text-slate-500">Kolkata, India</p>
                  <span className="inline-block mt-1 text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md">
                    Class 10 Completed
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Profile Details</h4>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Academic Focus</span>
                    <span className="font-semibold text-slate-800">Maths, Science & Computers</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Primary Goal</span>
                    <span className="font-semibold text-indigo-600">Technology & Software</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Roadmap Status</span>
                    <span className="font-semibold text-emerald-600">Step 1 Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* =========================================================
            BOTTOM APP BAR (EXACT 5 TABS MATCHING DESIGN)
        ========================================================== */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-2 flex justify-between items-center z-40">
          {/* 1. Home */}
          <button 
            onClick={() => { setActiveTab('home'); setCurrentScreen('home'); }}
            className={`flex flex-col items-center flex-1 transition ${activeTab === 'home' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          {/* 2. Roadmap */}
          <button 
            onClick={() => setActiveTab('roadmap')}
            className={`flex flex-col items-center flex-1 transition ${activeTab === 'roadmap' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
          >
            <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.284a2.25 2.25 0 00-2.012 0L2.616 5.722A1.125 1.125 0 002 6.728v11.664c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/></svg>
            <span className="text-[10px] mt-0.5">Roadmap</span>
          </button>

          {/* 3. Advisor */}
          <button 
            onClick={() => setActiveTab('advisor')}
            className={`flex flex-col items-center flex-1 transition ${activeTab === 'advisor' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
          >
            <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>
            <span className="text-[10px] mt-0.5">Advisor</span>
          </button>

          {/* 4. Resources */}
          <button 
            onClick={() => setActiveTab('resources')}
            className={`flex flex-col items-center flex-1 transition ${activeTab === 'resources' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
          >
            <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
            <span className="text-[10px] mt-0.5">Resources</span>
          </button>

          {/* 5. Profile */}
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