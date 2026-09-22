
# 🎓 PathMitra AI

> **Your honest, stage-aware guide from education to career — for every Indian student.**

PathMitra AI is a practical **education-to-career guidance** app for Indian students and their families. It helps students compare realistic routes after school, understand exams and scholarships, explore careers, build a step-by-step roadmap, and ask grounded questions through an AI advisor that answers from verified data first.

The product is built around one principle: **explain trade-offs clearly instead of pushing every student toward the same path.**

👉👉 [Live Preview](https://pathmitra-ai.vercel.app/) 👈👈

## ✨ What It Includes

| Emoji | Feature | Description |
|-------|---------|-------------|
| 🎯 | **Stage-aware onboarding** | Captures your stage (Class 10–12, diploma, ITI, B.Tech, medical, graduate, postgraduate), interests, budget, mobility, risk appetite, and family priorities |
| 🚀 | **Next best move playbooks** | Stage-specific ranked recommendations — jobs, placements, internships, exams, higher study, and skills — with honest pitfalls for every qualification |
| 💼 | **Placements & internships hub** | Readiness checklist, hiring tests (TCS NQT, eLitmus, AMCAT), campus drives, PM Internship Scheme, NATS/NAPS apprenticeships, and stage-matched listings |
| 🛤️ | **Route recommendations** | Academic, diploma, ITI, skills, and employment pathways with detailed trade-offs |
| 🔍 | **Explore views** | Pathway details — costs, duration, eligibility, outcomes, strengths, and trade-offs |
| 📚 | **Guide screens** | Entrance exams, careers, state guide, scholarships, skills, scenarios, and roadmap |
| ⚖️ | **Side-by-side comparison** | Compare routes on fees, time to first salary, and outcomes |
| 💾 | **Local persistence** | Saved pathways, exams, internships, and roadmap progress stored in your browser |
| 🤖 | **AI advisor** | Profile-aware answers, conversation history, and quick prompts |
| 🧠 | **Dataset-first answers** | Common questions answered from bundled data before any external AI is used |
| 📱 | **Responsive design** | Phone-style interface with a light theme and a desktop presentation frame |

---

## 🛠️ Tech Stack

- Next.js `16.3.5` with the App Router
- React `19.2.8` and TypeScript
- Tailwind CSS v4 through `@tailwindcss/postcss`
- Lucide React for interface icons
- Browser `localStorage` for profile persistence
- Gemini and OpenRouter as optional AI providers

## 📋 Quick Start

**Requirements:** Node.js 20+ and npm.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app works without AI API keys. The advisor answers first from the bundled datasets — greetings and quick messages, fees and total cost, government jobs and pay bands, duration and first-salary age, stage-wise options after Class 10, 11, 12, diploma, ITI, engineering, medical, degree and postgraduation, stream choice, ITI trades, defence routes, scholarships (amounts, documents and application windows), setbacks such as failed exams or a gap year, next-best-career playbooks, placements and internships, skill tracks and step-by-step roadmaps. Questions that genuinely need live or external facts are sent to a configured AI provider, and if none is configured the app says so instead of guessing.

## 🔐 Environment Variables

Create `.env.local` in the project root when external AI responses are needed:

```env
GOOGLE_AI_STUDIO_API_KEY=your_google_ai_studio_key
OPENROUTER_API_KEY=your_openrouter_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`GOOGLE_AI_STUDIO_API_KEY` is used first. `OPENROUTER_API_KEY` is used as a fallback when Gemini is unavailable or does not return an answer. `NEXT_PUBLIC_SITE_URL` is sent as the OpenRouter HTTP referer and should be set to the deployed site URL in production.

Never commit `.env.local` or expose provider keys in client-side code. The keys are read only by `src/app/api/chat/route.ts`.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint across the project |

## 💡 How the App Works

1. A student completes onboarding or opens the app with a blank profile.
2. Profile answers are scored against the bundled pathway data.
3. The home screen shows the closest routes and the rest of the app provides deeper guides.
4. Profile edits, saved items, and roadmap milestones are persisted in browser storage.
5. Advisor questions go to `/api/chat` with the relevant profile context.
6. The API checks local conversational skills and verified datasets first, then tries Gemini, then OpenRouter.

### 🧠 Offline-first advisor

`src/lib/chatbrain.ts` is the grounded brain. It runs before any network call, on every turn, and answers from the same data the screens render:

- **Quick messages** — greetings, "ok", "thanks", "are you real", "what can you do", confused or undecided openers.
- **Routes and comparisons** — pathway cards, exam cards, exam vs exam, pathway vs pathway, degree targets (B.Tech, MBBS, CA) and the diploma-to-B.Tech lateral entry bridge.
- **Money** — per-pathway government and private fees, total cost and payback from the ROI scenarios, affordability and fee-waiver questions mapped to scholarships.
- **Outcomes** — starting and experienced pay bands, government job routes by stage, and what a specific pathway leads to.
- **Decisions** — stream choice, options after Class 10 / 11 / 12 / ITI / diploma / a degree, next-best-career playbooks, step-by-step roadmap, and honest answers on failed exams, dropouts and gap years.
- **Placements & internships** — hiring tests (TCS NQT, eLitmus, AMCAT), campus drives, apprenticeship readiness, and stage-matched internship listings.
- **Next best move** — ranked jobs, placements, internships, exams, and skills tailored to each stage.
- **Scholarship logistics** — documents to keep ready and typical application windows, per scheme.
- **Follow-ups** — short messages such as "and the fees?" or "what about for girls?" are resolved against the previous question instead of being sent to a provider.

Because this layer answers most student questions, the AI keys are used far less often, which keeps the free-tier limits comfortable. Named private scholarships or organisations that are not in the datasets still go to the provider, because inventing their rules would be worse than saying "check the official portal".

The advisor is designed as guidance, not an official admissions or employment authority. Exam dates, fees, eligibility, and scholarship rules should always be confirmed on the linked official portal.

## 🏗️ Project Structure

```text
src/
  app/
    api/
      chat/route.ts        Advisor API and provider fallback logic
      stage-audit/route.ts QA endpoint — verifies stage coverage for all screens
    globals.css            Global styles and responsive text adjustments
    layout.tsx             Root metadata, fonts, and document shell
    page.tsx               Application entry point
  components/
    PathMitraApp.tsx       Navigation, routing, and profile state
    Onboarding.tsx         Guided stage-aware profile setup
    MarkdownMessage.tsx    Advisor response rendering
    ui.tsx                 Shared frame, cards, buttons, chips, and UI primitives
    screens/               Home, guides, advisor, profile, and detail screens
  data/
    pathways.ts            Education and career route definitions
    exams.ts               Entrance exam registry with eligibility and cycles
    careers.ts             Government and private career listings with pay bands
    scholarships.ts        Scholarship and fee-waiver schemes
    nextsteps.ts           Stage-wise "next best move" playbooks and checklists
    opportunities.ts       Placements, internships, hiring tests, and drives
    skills.ts              Skill tracks with milestones and beginner projects
    qualifications.ts      Stage registry (Class 10–12, diploma, ITI, degree, etc.)
    interests.ts           Stage-specific interest diagnostic questions
    states.ts              State-wise boards, councils, and portal links
  lib/
    chatbrain.ts           Local conversational and dataset-backed answers
    stagematch.ts          Stage-aware matching for careers, exams, scholarships
    greeting.ts            Time-aware greetings
    profile.ts             Profile persistence and profile helpers
    recommend.ts           Pathway scoring and recommendations
    roi.ts                 Cost, time, and return calculations
    types.ts               Shared TypeScript domain types
public/                      Static illustrations and assets
```

## 🔒 Data and Privacy

Profile data is stored in the browser under the `pathmitra.profile.v2` local-storage key. There is no account system in this version. The advisor request sends the relevant stage, interests, constraints, priorities, and recent chat history to the server route when an external answer is required.

To clear the local profile, use **Start over with a fresh profile** in the Profile screen, or remove the `pathmitra.profile.v2` key from browser storage during development.

## 📦 Production Build

Run the production checks locally:

```bash
npm run lint
npm run build
npm run start
```

For Vercel or another Node-compatible host, configure the environment variables in the deployment settings, build with `npm run build`, and start with `npm run start` when a persistent Node server is required.

## 🤝 Contributing

Keep new recommendations and guide content in `src/data/`, shared domain logic in `src/lib/`, and reusable visual patterns in `src/components/ui.tsx`. When adding an AI-backed answer, prefer a grounded local answer first and include an official source link wherever the topic involves dates, fees, admissions, or government schemes.

### 🛠️ Setting Up Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

---

## 📄 License

PathMitra AI is provided for educational and personal guidance purposes. The bundled datasets (exam dates, fees, eligibility, scholarship rules, pay bands) are compiled from publicly available government and institutional sources and are **not** an official admissions or employment authority — always verify on the linked official portals.

This project is marked `private` in `package.json`. External AI provider responses are subject to the terms of the selected provider (Gemini / OpenRouter). See each provider's documentation for details.

