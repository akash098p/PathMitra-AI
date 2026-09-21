'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { MarkdownMessage } from '@/components/MarkdownMessage';
import { describeProfile } from '@/lib/profile';
import { getTimeGreeting } from '@/lib/greeting';
import type { StudentProfile } from '@/lib/types';

// ============================================================================
// Advisor — sends the student profile with every question so the grounding
// context (stage, interests, budget, priorities) always travels with it.
// Answers render through the markdown parser, never as raw symbols.
// ============================================================================

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  source?: string;
}

// Every prompt below is answered from the bundled datasets, so tapping a chip
// never spends an AI call. Keep it that way when adding new ones.
const QUICK_PROMPTS = [
  'What is the next best career move for me?',
  'How do I get placed or find an internship?',
  'What can I do after Class 10?',
  'What can I do after Class 12 Science?',
  'What can I do after a diploma or ITI?',
  'What can I do after my degree?',
  'What should a medical student plan after MBBS?',
  'Compare Science PCM with a polytechnic diploma on fees and time to first salary',
  'What government jobs can I aim for after Class 12?',
  'How much will a diploma cost and which scholarships cover it?',
  'Which scholarships can my family actually apply for?',
  'What should I do next?',
  'How do I prepare for campus placements?',
  'Which apprenticeships can I join right now?',
  'How long does it take to start earning after a diploma?',
  'What skills should I start learning right now?',
  'How do I prepare for JEXPO and what does it open?',
];

export function AdvisorScreen({
  profile,
  initialQuestion,
}: {
  profile: StudentProfile;
  initialQuestion?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: `${getTimeGreeting()}! I am PathMitra. I can answer questions about streams, diplomas, ITI trades, entrance exams, government and private jobs, scholarships and the skills worth learning — using the same verified data as the rest of this guide. What would you like to understand better?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Pre-seed an advisor question when the screen is opened with one (e.g. from the
  // exams search "no match → ask advisor" link). We only act on the very first
  // render so a re-render of the parent does not keep replaying the question.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current && initialQuestion?.trim()) {
      firstRender.current = false;
      setInput(initialQuestion.trim());
      send(initialQuestion.trim());
    }
  }, [initialQuestion]);

  async function send(prompt?: string) {
    const text = (prompt ?? input).trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    if (!prompt) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          profile: {
            qualification: profile.qualification,
            interests: profile.interests,
            budget: profile.budget,
            mobility: profile.mobility,
            risk: profile.risk,
            priorities: profile.priorities,
          },
          history: messages.slice(-10).map((message) => ({
            role: message.sender === 'user' ? 'user' : 'assistant',
            content: message.text,
          })),
        }),
      });
      const data = (await res.json()) as { reply?: string; source?: string };
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply ?? 'I could not answer that. Please try again.',
          source: data.source,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Connection issue. Please check the internet and try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const contextSummary = describeProfile(profile);
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-base">
            🤖
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-bold text-slate-900">PathMitra Advisor</h2>
            <p className="text-[9px] text-emerald-600 font-semibold">
              {contextSummary ? 'Answering with your profile in mind' : 'Answering from the verified guide data'}
            </p>
          </div>
        </div>
        {contextSummary ? (
          <p className="text-[9px] text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{contextSummary}</p>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2.5">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-3 text-xs leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
              }`}
            >
              <MarkdownMessage text={msg.text} sender={msg.sender} />
            </div>
          </div>
        ))}

        {loading ? (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-400 flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              <span>Checking the guide data…</span>
            </div>
          </div>
        ) : null}

        <div ref={endRef} />
      </div>

      <div className="px-4 py-3 border-t border-slate-100 bg-white">
        <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => send(prompt)}
              disabled={loading}
              className="px-2.5 py-1 rounded-full border border-slate-200 bg-white text-slate-600 text-[10px] font-medium whitespace-nowrap hover:border-indigo-200 hover:text-indigo-700 transition disabled:opacity-50"
            >
              {prompt.length > 38 ? `${prompt.slice(0, 38)}…` : prompt}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
            placeholder="Ask about exams, fees, jobs or skills…"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="p-2.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition disabled:opacity-40"
            aria-label="Send question"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[9px] text-slate-400 mt-1.5 leading-relaxed">
          Advice is general guidance, not a guaranteed outcome. Verify every exam date and fee on the official portal.
        </p>
      </div>
    </div>
  );
}