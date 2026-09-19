'use client';

import React, { useEffect, useState } from 'react';
import { Bot, Compass, Home, Map as MapIcon, User } from 'lucide-react';
import { Onboarding } from '@/components/Onboarding';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { ExploreScreen } from '@/components/screens/ExploreScreen';
import { PathwayDetailScreen } from '@/components/screens/PathwayDetailScreen';
import { CompareScreen } from '@/components/screens/CompareScreen';
import { ExamsScreen, ExamDetailScreen } from '@/components/screens/ExamsScreen';
import { CareersScreen } from '@/components/screens/CareersScreen';
import { StateScreen } from '@/components/screens/StateScreen';
import { ScholarshipsScreen } from '@/components/screens/ScholarshipsScreen';
import { SkillsScreen } from '@/components/screens/SkillsScreen';
import { ScenarioScreen } from '@/components/screens/ScenarioScreen';
import { RoadmapScreen } from '@/components/screens/RoadmapScreen';
import { AdvisorScreen } from '@/components/screens/AdvisorScreen';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { PhoneFrame, ScreenHeader } from '@/components/ui';
import { EMPTY_PROFILE, loadProfile, saveProfile, toggleMilestone, toggleSavedPathway } from '@/lib/profile';
import { toggleSavedExam } from '@/lib/profile';
import type { PathwayId, StudentProfile } from '@/lib/types';

// ============================================================================
// App shell — single page app with a flat navigation model.
// route = { tab, sub, param } so deep screens can always return cleanly.
// ============================================================================

type Tab = 'home' | 'explore' | 'guide' | 'advisor' | 'profile' | 'profile-edit';

interface Route {
  tab: Tab;
  sub?: string;
  param?: string;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { id: 'explore', label: 'Explore', icon: <Compass className="w-5 h-5" /> },
  { id: 'guide', label: 'Guide', icon: <MapIcon className="w-5 h-5" /> },
  { id: 'advisor', label: 'Advisor', icon: <Bot className="w-5 h-5" /> },
  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
];

const GUIDE_INDEX = [
  { id: 'exams', label: 'Entrance exams', hint: 'Eligibility, cycles, official portals', emoji: '📝' },
  { id: 'careers', label: 'Jobs: govt & private', hint: 'Salary bands and growth ladders', emoji: '💼' },
  { id: 'states', label: 'My state guide', hint: 'Boards, councils, local portals', emoji: '📍' },
  { id: 'scholarships', label: 'Fees & scholarships', hint: 'NSP, AICTE, state schemes', emoji: '🎓' },
  { id: 'skills', label: 'Skills & apprenticeships', hint: 'Start learning this week', emoji: '🧩' },
  { id: 'scenarios', label: 'What-if simulator', hint: 'Compare full life timelines', emoji: '🔀' },
  { id: 'roadmap', label: 'My roadmap', hint: 'Personal checklist that persists', emoji: '🗺️' },
];

const SUBTITLES: Record<string, { title: string; subtitle?: string }> = {
  compare: { title: 'Compare routes', subtitle: 'See costs, time and outcomes side by side' },
  exams: { title: 'Entrance exams', subtitle: 'Eligibility, cycles and official portals' },
  careers: { title: 'Jobs: government and private', subtitle: 'Realistic pay bands and growth ladders' },
  states: { title: 'My state guide', subtitle: 'Boards, councils and portals' },
  scholarships: { title: 'Fees and scholarships', subtitle: 'Schemes matched to your stage' },
  skills: { title: 'Skills and apprenticeships', subtitle: 'Start now, without a degree' },
  scenarios: { title: 'What-if simulator', subtitle: 'Same student, different roads' },
  roadmap: { title: 'My roadmap', subtitle: 'Personal, persisted checklist' },
};

export default function PathMitraApp() {
  const [profile, setProfile] = useState<StudentProfile>(EMPTY_PROFILE);
  const [route, setRoute] = useState<Route>({ tab: 'home' });
  const [backStack, setBackStack] = useState<Route[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setHydrated(true);
  }, []);

  function update(next: StudentProfile) {
    setProfile(next);
    saveProfile(next);
  }

  function go(nextRoute: Route) {
    setBackStack((prev) => [...prev, route]);
    setRoute(nextRoute);
  }

  function back() {
    if (backStack.length === 0) {
      setRoute({ tab: 'home' });
      return;
    }
    const prev = backStack[backStack.length - 1];
    setBackStack((stack) => stack.slice(0, -1));
    setRoute(prev);
  }

  function resetStack() {
    setBackStack([]);
  }

  function renderScreen() {
    if (!hydrated) return null;
    if (route.tab === 'guide') {
      const sub = route.sub;
      const meta = sub ? (SUBTITLES[sub] ?? { title: 'Guide' }) : { title: 'Guide' };
      const back = () => {
        const current = backStack[backStack.length - 1];
        setBackStack((stack) => stack.slice(0, -1));
        if (!current) {
          setRoute({ tab: 'home' });
          return;
        }
        setRoute(current);
      };

      if (sub) {
        switch (sub) {
          case 'exams':
            return route.param ? (
              <ExamDetailScreen
                examId={route.param}
                profile={profile}
                onToggleSaved={(id) => update(toggleSavedExam(profile, id))}
                onBack={back}
              />
            ) : (
              <ExamsScreen
                profile={profile}
                onOpenExam={(id) => go({ tab: 'guide', sub: 'exams', param: id })}
                onToggleSaved={(id) => update(toggleSavedExam(profile, id))}
              />
            );
          case 'careers':
            return <CareersScreen profile={profile} onBack={back} />;
          case 'states':
            return <StateScreen profile={profile} />;
          case 'scholarships':
            return <ScholarshipsScreen profile={profile} />;
          case 'skills':
            return <SkillsScreen profile={profile} />;
          case 'scenarios':
            return <ScenarioScreen />;
          case 'roadmap':
            return <RoadmapScreen profile={profile} onToggleMilestone={(id) => update(toggleMilestone(profile, id))} />;
          case 'compare':
            return <CompareScreen profile={profile} onOpenPathway={(id) => go({ tab: 'explore', param: id })} />;
          default:
            return null;
        }
      }

      return (
        <div className="p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Your complete guide</h2>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Every dataset in PathMitra lives behind one of these doors.
          </p>
          {GUIDE_INDEX.map((item) => (
            <div
              key={item.id}
              onClick={() => go({ tab: 'guide', sub: item.id })}
              className="cursor-pointer bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex items-center justify-between hover:border-indigo-400 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.emoji}</span>
                <div>
                  <h3 className="text-[11px] font-bold text-slate-900">{item.label}</h3>
                  <p className="text-[10px] text-slate-500">{item.hint}</p>
                </div>
              </div>
              <span className="text-indigo-400">›</span>
            </div>
          ))}
        </div>
      );
    }

    switch (route.tab) {
      case 'home':
        return (
          <HomeScreen
            profile={profile}
            onOpenScreen={(screen) => {
              if (screen === 'advisor') {
                go({ tab: 'advisor' });
                return;
              }
              go({ tab: 'guide', sub: screen });
            }}
            onOpenPathway={(id) => setRoute({ tab: 'explore', param: id })}
            back={back}
          />
        );
      case 'explore':
        return route.param ? (
          <PathwayDetailScreen
            pathwayId={route.param}
            profile={profile}
            onBack={() => {
              const current = backStack[backStack.length - 1];
              setBackStack((stack) => stack.slice(0, -1));
              if (!current) {
                setRoute({ tab: 'home' });
                return;
              }
              setRoute(current);
            }}
            onOpenExam={(id) => go({ tab: 'guide', sub: 'exams', param: id })}
          />
        ) : (
          <ExploreScreen
            profile={profile}
            onOpenPathway={(id) => go({ tab: 'explore', param: id })}
            onToggleSaved={(id) => update(toggleSavedPathway(profile, id as PathwayId))}
            onBack={back}
          />
        );
      case 'advisor':
        return <AdvisorScreen profile={profile} />;
      case 'profile':
        return <ProfileScreen profile={profile} onUpdate={update} onRestart={() => setRoute({ tab: 'home' })} />;
      case 'profile-edit':
        return (
          <ProfileScreen
            profile={profile}
            onUpdate={update}
            onRestart={() => setRoute({ tab: 'home' })}
            hideAdvanced={true}
            onClose={() => setRoute({ tab: 'home' })}
          />
        );
      default:
        return null;
    }
  }
  // Gate: onboarding takes over the whole frame until the student completes it.
  if (!profile.onboarded) {
    return (
      <PhoneFrame>
        <Onboarding
          initial={profile}
          onComplete={(next) => update({ ...next, onboarded: true })}
          onCancel={hydrated ? () => setRoute({ tab: 'home' }) : undefined}
        />
      </PhoneFrame>
    );
  }

  // Allow browsing without completing onboarding: advisor and guide still work
  // with generic advice, and Profile can set the stage later.
  const subMeta = route.tab === 'guide' && route.sub ? SUBTITLES[route.sub] : undefined;
  const headerTitle =
    subMeta?.title ??
    (route.tab === 'home'
      ? 'PathMitra'
      : route.tab === 'explore'
        ? route.param
          ? 'Route details'
          : 'Explore routes'
        : route.tab === 'guide'
          ? 'Your complete guide'
          : route.tab === 'advisor'
            ? 'PathMitra Advisor'
            : route.tab === 'profile-edit'
              ? 'Edit profile'
              : route.tab === 'profile'
                ? 'Your profile'
                : 'PathMitra');
  const headerSubtitle =
    subMeta?.subtitle ??
    (route.tab === 'guide'
      ? 'Explore exams, careers and opportunities'
      : route.tab === 'advisor'
        ? 'Ask questions about your next step'
        : route.tab === 'profile-edit'
          ? 'Personal details saved on this device'
          : route.tab === 'profile'
            ? 'Your choices and saved routes'
            : undefined);

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        <div className="px-4 pt-5 pb-2 bg-white border-b border-slate-100">
            <ScreenHeader
              title={headerTitle}
              subtitle={headerSubtitle}
              onBack={
                route.param || (route.tab === 'guide' && route.sub)
                  ? back
                  : undefined
              }
              right={
                <div className="relative flex items-center justify-center w-10 h-10 aspect-square shrink-0">
                  <div className="absolute inset-0 aspect-square rounded-full border-2 border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.25)] animate-[spin_4s_linear_infinite]" />
                  <button
                    onClick={() => setRoute({ tab: 'profile-edit' })}
                    aria-label="Open profile editor"
                    className="relative z-10 w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold flex items-center justify-center"
                  >
                    {profile.name ? profile.name.slice(0, 1).toUpperCase() : '☺'}
                  </button>
                </div>
              }
            />
        </div>

        <div className="flex-1 overflow-y-auto">{renderScreen()}</div>
      </div>

      <nav className="bg-white border-t border-slate-100 px-2 py-2 flex justify-between items-center z-40">
        {TABS.map((tab) => {
          const active = route.tab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setRoute({ tab: tab.id })}
              className={`flex flex-col items-center flex-1 py-1 rounded-xl transition ${
                active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.icon}
              <span className={`text-[9px] mt-0.5 ${active ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </PhoneFrame>
  );
}