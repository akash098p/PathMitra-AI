'use client';

import React, { useState } from 'react';
import { 
  Menu, Bell, Compass, Scale, Map, Bot, BookOpen, 
  BarChart2, ChevronRight, ChevronLeft, Heart, Share2, 
  Send, Sparkles, User, GraduationCap, Laptop, Wrench, GitFork
} from 'lucide-react';

export default function PathMitraApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'options' | 'roadmap' | 'advisor'>('home');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello Arjun! How can I help you choose between Science, Diploma, or ITI today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMsg = inputMessage;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          educationStage: 'Class 10 Completed',
          goal: 'Explore Technology Careers'
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
    } catch {
      setChatMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, I had trouble connecting. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-0 sm:p-6 font-sans">
      {/* Mobile Frame Container */}
      <div className="relative w-full max-w-[420px] h-[100dvh] sm:h-[880px] bg-slate-50 sm:rounded-[48px] shadow-2xl overflow-hidden border-0 sm:border-[8px] border-slate-800 flex flex-col">
        
        {/* Dynamic Island Indicator (Desktop) */}
        <div className="hidden sm:flex absolute top-0 left-0 right-0 h-8 z-50 justify-center items-center pointer-events-none">
          <div className="w-28 h-4 bg-black rounded-full mt-1 flex items-center justify-end px-3">
            <div className="w-2 h-2 rounded-full bg-slate-800"></div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="pt-3 px-7 pb-2 flex justify-between items-center text-xs font-semibold text-slate-800 bg-white z-40 select-none">
          <span>9:41</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-5 h-2.5 border border-slate-800 rounded-sm p-0.5 flex items-center">
              <div className="h-full w-3 bg-slate-800 rounded-xs"></div>
            </div>
          </div>
        </div>

        {/* Dynamic Screen Viewport */}
        <main className="flex-1 overflow-y-auto pb-20 relative">
          
          {/* SCREEN 1: HOME */}
          {activeTab === 'home' && (
            <div className="p-4 space-y-4">
              <header className="flex items-center justify-between py-1">
                <button className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition"><Menu className="w-6 h-6" /></button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-sm font-extrabold text-slate-900 leading-none">PATHMITRA <span className="text-indigo-600">AI</span></h1>
                    <p className="text-[10px] text-slate-500 font-medium">Your AI Guide to Career</p>
                  </div>
                </div>
                <button className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl relative transition">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full"></span>
                </button>
              </header>

              {/* Student Profile Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-500 p-5 text-white shadow-xl shadow-indigo-100">
                <div className="relative z-10 max-w-[65%]">
                  <h2 className="text-xl font-bold">Hello Arjun 👋</h2>
                  <div className="mt-3">
                    <span className="text-[10px] text-indigo-200 uppercase tracking-wider font-semibold">Education Stage</span>
                    <p className="text-xs font-semibold text-white">Class 10 Completed</p>
                  </div>
                  <div className="mt-2">
                    <span className="text-[10px] text-indigo-200 uppercase tracking-wider font-semibold">Goal</span>
                    <p className="text-xs font-bold text-white">Explore Technology Careers</p>
                  </div>
                </div>
                <div className="absolute right-3 bottom-0 w-28 h-32 flex items-end">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" alt="Arjun Avatar" className="w-24 h-24 object-cover rounded-2xl border-2 border-indigo-200/50 shadow-md" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div onClick={() => setActiveTab('options')} className="cursor-pointer bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition flex items-center justify-between group">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Compass className="w-6 h-6" /></div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">Explore Career Paths</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Discover careers that match your interests and skills</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div onClick={() => setActiveTab('options')} className="cursor-pointer bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition flex items-center justify-between group">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Scale className="w-6 h-6" /></div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">Compare Education Options</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Compare different streams and courses</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* 2x2 Menu Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div onClick={() => setActiveTab('roadmap')} className="cursor-pointer bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm hover:border-indigo-200 transition flex items-start space-x-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Map className="w-5 h-5" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">My Roadmap</h4>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">See personalized roadmap</p>
                  </div>
                </div>

                <div onClick={() => setActiveTab('advisor')} className="cursor-pointer bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm hover:border-indigo-200 transition flex items-start space-x-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Bot className="w-5 h-5" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">AI Advisor</h4>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Chat with AI guide</p>
                  </div>
                </div>

                <div className="cursor-pointer bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm hover:border-indigo-200 transition flex items-start space-x-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><BookOpen className="w-5 h-5" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Resources</h4>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Courses & materials</p>
                  </div>
                </div>

                <div className="cursor-pointer bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm hover:border-indigo-200 transition flex items-start space-x-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><BarChart2 className="w-5 h-5" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Skill Analysis</h4>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Analyze strengths</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: OPTIONS */}
          {activeTab === 'options' && (
            <div className="p-4 space-y-4">
              <header className="flex items-center justify-between py-1">
                <button onClick={() => setActiveTab('home')} className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl"><ChevronLeft className="w-5 h-5" /></button>
                <h2 className="text-sm font-bold text-slate-900">Explore Your Options</h2>
                <button className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl"><Heart className="w-5 h-5" /></button>
              </header>

              <div className="flex items-center justify-between px-1">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Your Interest</span>
                  <h3 className="text-2xl font-black text-indigo-600">Technology</h3>
                </div>
                <div className="text-3xl">💻🚀</div>
              </div>

              {/* 4 Quadrants */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="p-2 bg-emerald-100/70 w-fit rounded-xl text-emerald-700 mb-2"><GraduationCap className="w-5 h-5" /></div>
                    <h4 className="text-xs font-bold text-slate-900">Science Stream</h4>
                    <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">Class 11-12 with PCM. Foundation for B.Tech, Research, and Computing.</p>
                  </div>
                  <button onClick={() => setActiveTab('roadmap')} className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 mt-3">View Details →</button>
                </div>

                <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="p-2 bg-blue-100/70 w-fit rounded-xl text-blue-700 mb-2"><Laptop className="w-5 h-5" /></div>
                    <h4 className="text-xs font-bold text-slate-900">Diploma in CS</h4>
                    <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">3-Year polytechnic. Direct industry skills and lateral entry to engineering.</p>
                  </div>
                  <button onClick={() => setActiveTab('roadmap')} className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 mt-3">View Details →</button>
                </div>

                <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="p-2 bg-amber-100/70 w-fit rounded-xl text-amber-700 mb-2"><Wrench className="w-5 h-5" /></div>
                    <h4 className="text-xs font-bold text-slate-900">ITI / Vocational</h4>
                    <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">Fast, direct technical certifications and rapid employment routes.</p>
                  </div>
                  <button onClick={() => setActiveTab('roadmap')} className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 mt-3">View Details →</button>
                </div>

                <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="p-2 bg-rose-100/70 w-fit rounded-xl text-rose-700 mb-2"><GitFork className="w-5 h-5" /></div>
                    <h4 className="text-xs font-bold text-slate-900">Other Paths</h4>
                    <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">Commerce with Informatics, Design (UI/UX), or Computer Applications (BCA).</p>
                  </div>
                  <button onClick={() => setActiveTab('roadmap')} className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 mt-3">View Details →</button>
                </div>
              </div>

              <button onClick={() => setActiveTab('roadmap')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-100 transition text-xs flex items-center justify-center space-x-2">
                <Scale className="w-4 h-4" />
                <span>Compare Selected Options</span>
              </button>

              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center space-x-3">
                <div className="flex-1">
                  <h5 className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Insight
                  </h5>
                  <p className="text-[10px] text-indigo-700 mt-1 leading-relaxed">
                    Based on your profile, both Science (PCM) and Polytechnic Diploma grant access to software careers. Tap below to see your full roadmap.
                  </p>
                </div>
                <Bot className="w-10 h-10 text-indigo-600 flex-shrink-0" />
              </div>
            </div>
          )}

          {/* SCREEN 3: ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="p-4 space-y-4">
              <header className="flex items-center justify-between py-1">
                <button onClick={() => setActiveTab('options')} className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl"><ChevronLeft className="w-5 h-5" /></button>
                <h2 className="text-sm font-bold text-slate-900">My AI Career Roadmap</h2>
                <button className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl"><Share2 className="w-5 h-5" /></button>
              </header>

              <div className="rounded-2xl bg-indigo-950 p-4 text-white flex items-center space-x-3.5 shadow-md">
                <div className="p-2 bg-indigo-800 rounded-xl text-indigo-200"><Compass className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] text-indigo-300 uppercase font-semibold tracking-wider">Goal</p>
                  <h3 className="text-sm font-bold text-white">Technology Career</h3>
                </div>
              </div>

              {/* Step-by-Step Vertical Timeline */}
              <div className="relative space-y-3 pl-1 pt-1">
                <div className="absolute left-4 top-4 bottom-4 w-0.5 border-l-2 border-dashed border-slate-300"></div>

                {[
                  { step: '1', title: 'Choose Education Path', desc: 'Select between Science stream (PCM) or 3-Year Polytechnic Diploma.', color: 'bg-emerald-500' },
                  { step: '2', title: 'Build Foundation Skills', desc: 'Strengthen Mathematics, logical deduction, and fundamental computing.', color: 'bg-blue-500' },
                  { step: '3', title: 'Learn Programming / Core Skills', desc: 'Master foundational syntax like Python, C++, and basic web development.', color: 'bg-indigo-500' },
                  { step: '4', title: 'Build Projects', desc: 'Create 2-3 portfolio projects (calculators, web apps, automated tools).', color: 'bg-amber-500' },
                  { step: '5', title: 'Higher Education / Training', desc: 'Pursue B.Tech, BCA, or specialized certifications.', color: 'bg-pink-500' },
                  { step: '6', title: 'Internship & Career Prep', desc: 'Resume building, mock technical interviews, and applying for internships.', color: 'bg-purple-600' }
                ].map((item) => (
                  <div key={item.step} className="relative flex items-start space-x-3 z-10 bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm">
                    <div className={`w-7 h-7 rounded-full ${item.color} text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={() => setActiveTab('advisor')} className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-2xl p-3 flex items-center space-x-2 transition">
                  <Bot className="w-5 h-5 text-indigo-600" />
                  <span className="text-[11px] font-bold text-indigo-950">Ask AI Advisor</span>
                </button>
                <button className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-2xl p-3 flex items-center space-x-2 transition">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <span className="text-[11px] font-bold text-indigo-950">Resources</span>
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 4: AI ADVISOR (Interactive Chat) */}
          {activeTab === 'advisor' && (
            <div className="p-4 flex flex-col h-full space-y-3">
              <header className="flex items-center justify-between py-1 border-b border-slate-100 pb-2">
                <button onClick={() => setActiveTab('home')} className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl"><ChevronLeft className="w-5 h-5" /></button>
                <div className="flex items-center space-x-1.5">
                  <Bot className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900">AI Career Advisor</h2>
                </div>
                <div className="w-9"></div>
              </header>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-800 shadow-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 text-xs text-slate-400">PathMitra is thinking...</div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about diplomas, PCM, or skills..." 
                  className="flex-1 bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-600"
                />
                <button onClick={sendMessage} className="p-2.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Persistent Bottom Tab Bar */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-2.5 flex justify-between items-center z-40">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center flex-1 ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5">Home</span>
          </button>
          <button onClick={() => setActiveTab('roadmap')} className={`flex flex-col items-center flex-1 ${activeTab === 'roadmap' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Map className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5">Roadmap</span>
          </button>
          <button onClick={() => setActiveTab('advisor')} className={`flex flex-col items-center flex-1 ${activeTab === 'advisor' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Bot className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5">Advisor</span>
          </button>
          <button onClick={() => setActiveTab('options')} className={`flex flex-col items-center flex-1 ${activeTab === 'options' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Scale className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5">Compare</span>
          </button>
          <button className="flex flex-col items-center flex-1 text-slate-400">
            <User className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5">Profile</span>
          </button>
        </nav>

      </div>
    </div>
  );
}