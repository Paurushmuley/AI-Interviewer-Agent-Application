# AI Interviewer - Project Memory

## 1. Project Overview & Intent
- **Project Name**: AI Interviewer
- **Core Mission**: Build an AI-driven, highly realistic interview platform that dynamically conducts live job interviews based on a candidate's uploaded resume and a specific Job Description (JD).
- **Core Strategy**: Combine traditional **NLP** (resume parsing, speech filler detection, semantic relevance scoring, speech rate analysis) with **LLM intelligence** (adaptive questioning, dynamic follow-ups, contextual technical depth, evaluation rubrics).
- **Realistic Video Conference Simulation**:
  - Interactive on-screen AI Avatar (`AiAvatar.tsx`) with audio-reactive lip movement (viseme/lip-sync) and natural eye blinking.
  - Candidate WebCam preview (`CandidateCam.tsx`) with camera/mic toggles and audio meter.
  - Configurable interview duration (15m, 30m, 45m, 60m) with dynamic state pacing and 5-min warning timer.
  - Coding profile support: Live in-browser code editor (`CodeWorkspace.tsx`), tailored programming challenges matched to JD & experience level, and automated code quality/correctness scoring.
- **Account Management & Historical Results**:
  - User registration & authentication with encrypted passwords (`bcryptjs` + JWT).
  - Dashboard tracking past interviews, performance trends over time, and detailed question-by-question review.
- **Local Testing Engine**: Dedicated backend sub-agent (`LocalInterviewSubAgent`) to simulate/mock LLM, NLP, and coding tasks locally for zero-cost rapid testing (and local model support via Ollama).
- **BYOK (Bring Your Own Key) Support**: Multi-LLM provider support (OpenAI, Google Gemini, Groq, xAI Grok, Anthropic) with end-to-end AES-256-GCM encryption.
- **Hosting & Infrastructure**:
  - Frontend & Backend: Next.js 15 App Router (Vercel-ready)
  - Temporary Document Storage: Vercel Blob (`@vercel/blob`)
  - Database: PostgreSQL with Prisma ORM
  - Environment Variables: User provides production credentials in `.env` (template provided in `.env.example`).

---

## 2. Key Architecture Pillars Implemented
1. **Security & Cryptography (`src/lib/crypto.ts`)**:
   - AES-256-GCM authenticated cipher with unique 96-bit IV and 128-bit authentication tag per key.
   - Master encryption key derived with SHA-256. Zero plain-text logging.
2. **Hybrid NLP Engine**:
   - `src/lib/nlp/speech-analyzer.ts`: Real-time filler detection (*"um", "like", "you know"*), WPM calculation, hesitation markers, and confidence scoring (0-100%).
   - `src/lib/nlp/resume-parser.ts`: Heuristic and regex entity extraction (skills, projects, experience years, seniority) + JD alignment percentage.
3. **Multi-LLM & Local Engines (`src/lib/llm/`)**:
   - `adapter.ts`: Unified router supporting Antigravity AI Sub-Agent, Local Ollama, and external BYOK providers (OpenAI, Gemini, Groq, xAI Grok, Anthropic).
   - `antigravity-agent.ts`: Autonomous built-in Antigravity AI Sub-Agent (`AntigravityInterviewSubAgent`) assigned as lead interviewer in place of external LLMs (zero-cost, intelligent state machine, dynamic coding prompts, and evaluations).
   - `ollama-adapter.ts`: Connects directly to local Ollama on `http://127.0.0.1:11434` with model selector (`llama3.2`, `deepseek-r1`, `mistral`) and live daemon ping.
4. **Account Management & Authentication (`src/lib/auth.ts`, `src/app/api/auth/`)**:
   - Registration, login, JWT cookies, and password hashing with `bcryptjs`.
   - Dashboard with aggregate stats (average score, highest score, total practice minutes) and past interview logs.
5. **Interactive UI & Real-Time Interview Room**:
   - `AiAvatar.tsx`: Lip-sync animated SVG canvas reactive to spoken audio.
   - `CandidateCam.tsx`: Live WebCam feed with audio indicator.
   - `CodeWorkspace.tsx`: Multi-language coding IDE with test case runner and instant automated feedback.
   - `SpeechMetricsBadge.tsx`: Visual feedback on pacing, WPM, and filler counts.
   - `report/[id]/page.tsx`: Post-interview report with scorecards, strengths, improvements, and synchronized transcripts.

---

## 3. Implementation Progress Checklist
- [x] **Phase 1: Project Blueprint & Setup**
  - [x] Initialized Next.js 15 with TypeScript, Tailwind CSS, and App Router.
  - [x] Configured `.env.example` and local `.env`.
  - [x] Created Prisma schema with PostgreSQL models (`User`, `UserApiKey`, `Interview`, `InterviewRound`, `CodingSubmission`, `TranscriptMessage`, `EvaluationReport`).
  - [x] Implemented AES-256-GCM encryption/decryption utilities and Vercel Blob client.
- [x] **Phase 2: Authentication & Account Dashboard**
  - [x] Implemented `/api/auth/register`, `/api/auth/login`, and `/api/auth/me`.
  - [x] Built User Dashboard (`/dashboard`) displaying profile, past interview history, performance stats, and BYOK key manager.
- [x] **Phase 3: BYOK Security Subsystem**
  - [x] Implemented `/api/keys` and `/api/keys/verify` for encrypted key persistence.
  - [x] Multi-LLM provider adapter supporting OpenAI, Gemini, Groq, xAI Grok, Anthropic.
- [x] **Phase 4: Document Parsing & NLP Pre-Processor**
  - [x] Implemented `/api/upload` with Vercel Blob storage and `pdf-parse`.
  - [x] Resume NLP parser and JD alignment calculation (`src/lib/nlp/resume-parser.ts`).
- [x] **Phase 5: Local Testing Backend Sub-Agent**
  - [x] Implemented `LocalInterviewSubAgent` with heuristic interview state engine + Ollama integration.
  - [x] Automated test runner (`scripts/verify-core.ts`) verifying all subsystems.
- [x] **Phase 6: Realistic Interview Room (Avatar, WebCam & Audio Pacing)**
  - [x] Built `AiAvatar.tsx` with audio-reactive mouth openness animation.
  - [x] Built `CandidateCam.tsx` with live camera/mic streaming.
  - [x] Configurable session duration timer (15, 30, 45, 60 min) with dynamic state pacing.
  - [x] Built real-time speech NLP analyzer (`analyzeSpeechTranscript`) and UI badge.
  - [x] Integrated Web Speech API STT and Web Speech Synthesis TTS.
- [x] **Phase 7: Live Coding Challenge Engine**
  - [x] Built `CodeWorkspace.tsx` with multi-language code editor and test case runner.
  - [x] Coding challenge generator and automated scoring endpoint (`/api/interview/[id]/code`).
- [x] **Phase 8: Evaluation Dashboard & Post-Interview Report**
  - [x] Implemented `/api/interview/[id]/evaluate` calculating multi-dimensional scores.
  - [x] Built `/report/[id]` with full scorecard, strengths, improvements, and question-by-question breakdown.
- [x] **Phase 9: Verification, Polish & Vercel Deployment Readiness**
  - [x] Production build (`npm run build`) compiled successfully with all 16 routes verified.
  - [x] Verification script passed 100%.

---

## 4. Current Status
- **Current Status**: All core features implemented, verified, and build passing cleanly. Server running on port 5000.
- **Ready for**: Local testing via http://localhost:5000 and production deployment to Vercel.
