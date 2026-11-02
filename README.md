<div align="center">

# 🎙️ AI Interviewer Agent Application
### *The Hyper-Realistic, Hybrid NLP + LLM Conversational Interview Simulation Platform*

[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![AES-256-GCM](https://img.shields.io/badge/Security-AES--256--GCM-green?style=for-the-badge)](https://en.wikipedia.org/wiki/Galois/Counter_Mode)

<p align="center">
  <b>Simulate high-stakes tech interviews with an audio-reactive lip-sync AI avatar, real-time verbal speech NLP metrics, hands-free two-way voice communication, live coding challenges, and personalized, 100% answer-dependent performance scorecards.</b>
</p>

[Quick Start](#-installation--getting-started) • [How to Use](#-how-to-use-the-app-step-by-step-guide) • [Interactive Superpowers](#-how-this-app-helps-in-an-interactive--creative-manner) • [AI Engines](#-ai-engine-options-zero-cost-local-vs-cloud-byok)

---

</div>

## 📖 Table of Contents
1. [What is AI Interviewer Agent?](#-what-is-ai-interviewer-agent)
2. [How this App Helps in an Interactive & Creative Manner](#-how-this-app-helps-in-an-interactive--creative-manner)
3. [How to Use the App (Step-by-Step Guide)](#-how-to-use-the-app-step-by-step-guide)
4. [AI Engine Options (Zero-Cost Local vs Cloud BYOK)](#-ai-engine-options-zero-cost-local-vs-cloud-byok)
5. [Installation & Getting Started](#-installation--getting-started)
6. [Interactive Feature Matrix](#-interactive-feature-matrix)
7. [Security & AES-256-GCM Encryption](#-security--aes-256-gcm-encryption)
8. [Automated Verification Suite](#-automated-verification-suite)
9. [Deployment (Vercel + Supabase)](#-deployment-vercel--supabase)

---

## 🎯 What is AI Interviewer Agent?

**AI Interviewer Agent** is a next-generation interview intelligence platform designed to bridge the gap between passive interview prep (e.g., reading LeetCode solutions or memorizing cheat sheets) and real-world high-pressure video interviews.

Traditional mock interview tools either rely on expensive human coaches or rigid chatbots with generic questionnaire scripts. **AI Interviewer Agent** transforms prep into a **living, breathing video call simulation**:
- **Resume & JD Alignment**: Upload your PDF/DOCX Resume and target Job Description. The platform extracts your claimed skills and cross-references them against JD requirements to formulate tailored, seniority-calibrated questions.
- **Realistic AI Interviewer (Arohi)**: Led by **Arohi**, an articulate AI lead tech interviewer equipped with natural Indian English cadence, lip-sync audio reactivity, and contextual listening.
- **Hybrid NLP + LLM Architecture**: Combines deterministic Natural Language Processing (filler-word extraction, words-per-minute cadence analysis, lexical diversity TTR) with LLMs for deep conversational intelligence and code grading.
- **Multi-Modal Interaction**: Dual-feed video room (AI avatar + live candidate webcam), dynamic code editor with automatic test evaluation, and voice/push-to-talk controls.
- **Zero-Generalized Feedback**: Delivers an exhaustive question-by-question scorecard quoting your exact spoken words, grading technical accuracy, and providing an L5/L6 senior engineer benchmark for every response.

---

## 💡 How this App Helps in an Interactive & Creative Manner

This platform is engineered from the ground up to be **engaging, realistic, and creativity-inspiring**, breaking away from static forms and canned chatbot bubbles.

```
       ┌────────────────────────────────────────────────────────┐
       │             AI INTERVIEWER CONVERSATION LOOP           │
       └────────────────────────────────────────────────────────┘
                                   │
                    1. AI Interviewer Speaks (TTS)
                                   ▼
        ┌──────────────────────────────────────────────────────┐
        │  • Arohi's mouth lip-syncs dynamically with audio    │
        │  • Microphone automatically mutes to prevent echo    │
        └──────────────────────────────────────────────────────┘
                                   │
                     2. AI Finishes Speaking
                                   ▼
        ┌──────────────────────────────────────────────────────┐
        │  • Mic un-mutes automatically (Hands-Free Two-Way)   │
        │  • Real-time speech recognition catches spoken words │
        └──────────────────────────────────────────────────────┘
                                   │
                     3. Candidate Speaks Answer
                                   ▼
        ┌──────────────────────────────────────────────────────┐
        │  • Words stream live into candidate response box     │
        │  • Continuous NLP evaluates WPM, fillers, confidence │
        └──────────────────────────────────────────────────────┘
                                   │
              4. Natural Conversational Pause (2.1s silence)
                                   ▼
        ┌──────────────────────────────────────────────────────┐
        │  • Visual countdown banner with "Send Now" override  │
        │  • Turn auto-submits to AI Interviewer Engine        │
        └──────────────────────────────────────────────────────┘
                                   │
             5. Next Adaptive Question / Coding Challenge
                                   └───────────────────────────► Loop
```

### 1. 🎭 Audio-Reactive Lip-Sync AI Avatar (Arohi)
- **Natural Facial Reactivity**: Arohi's mouth openness, jaw position, and phoneme shapes dynamically react to real-time Web Speech audio frequencies.
- **Subtle Human Polish**: Features natural ambient eye blinking, breathing animations, and audio-reactive status rings (speaking, listening, thinking).
- **Human Conversational Tempo**: Calibrated default rate of `1.12x` eliminates sluggish phoneme stretching. Candidates can toggle speed in real-time (`1.0x Normal`, `1.12x Natural Fast`, `1.2x Brisk`, `1.3x Rapid`) and choose between multiple neural Indian voices.

### 2. 🗣️ Hands-Free Two-Way Conversational Communication
- **Full-Duplex Experience**: Talk naturally like you are in an authentic Zoom or Google Meet interview without clicking buttons back and forth.
- **Echo-Free Auto Pacing**: When Arohi speaks, the candidate mic is safely suspended. As soon as Arohi finishes, your mic activates with `"Listening to you..."`.
- **Intelligent Pause Detection**: When you conclude your answer, a 2.1-second silence window activates a sleek visual countdown (*"Answer captured. Sending to Arohi in 2s..."*). You can either let it auto-send, tap **"Send Now"**, or hit **"Keep Speaking"** if you need another moment.
- **Candidate Flexibility**: Easily switch between **Hands-Free Two-Way Mode** and **Manual Push-to-Talk Mode** at any moment with a single click.

### 3. 📈 Live Speech NLP Analytics HUD
As you speak, the application computes non-verbal and verbal delivery metrics on the fly:
- **Filler Word Detection**: Instantly counts instances of verbal crutches (*"um"*, *"uh"*, *"like"*, *"you know"*, *"basically"*, *"literally"*, *"actually"*).
- **Words-Per-Minute (WPM) Pacing**: Measures your verbal cadence against standard professional communication benchmarks:
  - `< 110 WPM`: Hesitant / Slow pacing
  - `110 – 165 WPM`: Optimal, articulate conversational pace
  - `> 165 WPM`: Rushed / High pressure
- **Confidence Scoring (0–100%)**: Calculates a live confidence metric by evaluating strong action verbs, technical vocabulary density, and hesitation markers.

### 4. 💻 JD-Calibrated In-Browser Live Coding Profile
- When you configure a coding-focused or full-loop interview, the state machine smoothly transitions from conversational rounds into a **Live Coding Challenge**.
- Features an integrated multi-language IDE (**JavaScript**, **TypeScript**, **Python**) with syntax highlighting, indentation, and custom problem statements.
- Direct test execution executes code against test assertions, evaluating correctness, edge cases, and time/space complexity ($O(N)$ vs $O(N^2)$).

### 5. 🔍 100% Answer-Dependent, Non-Generalized Report Card
Unlike typical AI wrappers that output generic motivational paragraphs, every report generated by AI Interviewer is **strictly grounded in what you said and submitted**:
- **Question-by-Question Deep Evaluation**:
  - Direct quotes of the interviewer's exact question and your actual spoken transcript.
  - Quality Badge rating (*"Strong & Articulate"*, *"Solid with Minor Gaps"*, *"Partially Answered"*, *"Vague / Needs Depth"*).
  - Highlights **Demonstrated Strengths**, **Critical Gaps**, and an **L5/L6 Senior Benchmark Answer** showing exactly how a staff engineer would answer.
- **Lexical Diversity & Repetition Analytics**:
  - Measures your **Type-Token Ratio (TTR)**: $\text{Lexical Diversity} = \frac{\text{Unique Words}}{\text{Total Spoken Words}} \times 100\%$.
  - Highlights your most repeated non-stop words and crutch phrases with exact occurrence counts.
- **Actionable 4-Week Growth Roadmap**:
  - Prioritized technical gaps broken into **"Why It Matters"**, **"Actionable Remedy"**, and a **"Targeted Practice Question"** for your next session.
  - One-click **PDF Export** and **Re-analyze Report** buttons for record keeping.

### 6. 📱 Responsive, Mobile-First Adaptive Experience
- Practice on the go! Built with fluid viewport scaling (`100dvh`), avoiding browser address bar clipping on iOS Safari and Android Chrome.
- Responsive **3-Tab Live Switcher** on mobile (**Video**, **Code**, **Transcript**), giving mobile candidates full access to question replays and coding without cramped desktop viewports.

---

## 🚀 How to Use the App (Step-by-Step Guide)

Follow this end-to-end workflow to prepare for your dream job:

```
    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
    │ 1. Sign In / │ ──► │  2. Wizard   │ ──► │ 3. Live Room │ ──► │  4. Deep QA  │
    │  Quick Dev   │     │ Setup & BYOK │     │ Video & Code │     │ Report Card  │
    └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### Step 1: Sign In or Register
1. Navigate to [`/login`](http://localhost:5000/login) or [`/register`](http://localhost:5000/register).
2. Create an account with your name, email, and password.
3. *Tip for local development*: On localhost, an **"Auto-fill Dev Account"** banner is provided for one-click instant authentication without typing.

### Step 2: Configure Your Interview Session
Head over to [`/setup`](http://localhost:5000/setup) to launch the **Interactive Interview Wizard**:
1. **Target Job Title & Seniority**: Select your desired role (e.g. *Senior Full-Stack Engineer*, *DevOps Specialist*, *Backend Architect*) and seniority level (*Entry*, *Mid*, *Senior*, *Lead*).
2. **Session Duration**: Choose your preferred duration (**15m**, **30m**, **45m**, **60m**, or custom). The platform's dynamic state machine automatically calibrates how many questions, coding challenges, and deep-dives to fit within your time budget.
3. **Upload Your Resume**: Drop your PDF, DOCX, or TXT resume. The parser analyzes your listed technologies, projects, and work history.
4. **Target Job Description**: Paste the job description for the company or role you're targeting. The engine cross-references your resume skills against the JD to pinpoint strengths and probe gaps.

### Step 3: Choose Your AI Intelligence Engine
Select how you want Arohi powered:
- **Antigravity AI Sub-Agent (Default on Local)**: Completely free, runs locally, zero API keys required!
- **Local Ollama**: Connect directly to your local models (`llama3.2`, `deepseek-r1:1.5b`, `mistral`, etc.).
- **Cloud BYOK (Bring Your Own Key)**: Choose OpenAI, Google Gemini, Groq, xAI Grok, or Claude, and enter your API key (encrypted with AES-256-GCM).

Click **Enter Live Interview Room** to generate your customized session!

### Step 4: The Live Video Call Experience
1. **Join the Call**: Click the luminous **"Join Video Call & Start Speaking"** banner to initialize your camera and browser audio permissions.
2. **Arohi Introduces Herself**: Arohi greets you in natural Indian English, establishes rapport, and asks your first tailored question.
3. **Speak Your Mind**:
   - In **Hands-Free Two-Way Mode**, simply speak into your microphone.
   - Watch your words transcribe in real time.
   - Watch the live speech NLP badge update your WPM cadence and filler word counts.
4. **Auto-Submit or Fine-Tune**: When you stop speaking, the 2.1-second countdown will seamlessly hand off your answer to Arohi. You can also edit the text box manually if you want to revise a technical term before sending.
5. **Listen to Follow-Ups**: Arohi acknowledges your answers (*"Understood, that makes sense with Postgres indexing. Now walk me through..."*) and deepens the inquiry.

### Step 5: Tackling the Live Coding Round
1. If your interview includes coding, the platform alerts you when the live coding round begins.
2. On desktop, the **Code Workspace** docks beside the video call. On mobile, tap the **Code** tab.
3. Read the JD-calibrated problem statement, choose your programming language, write your solution, and click **Run Code & Submit**.
4. The system executes test assertions and incorporates code quality and algorithmic efficiency directly into your evaluation.

### Step 6: Concluding & Reviewing Your Report Card
1. Whenever you finish or if your session timer expires, click **"End Interview"**.
2. A safety confirmation modal appears (*"Are you sure you want to conclude and finalize your scorecard?"*).
3. Confirming terminates audio synthesis and speech recognition immediately, compiles your answers, and routes you to your comprehensive **Performance Report** (`/report/[id]`).

### Step 7: Continuous Improvement & Progress Tracking
1. Inspect your **Question-by-Question Deep Evaluation**: See where you excelled and read the L5/L6 senior engineer benchmark answers.
2. Check your **Lexical Diversity & Filler Analytics** to eliminate crutch words like *"basically"* or *"like"*.
3. Review your **4-Week Structured Mastery Roadmap** to target your weakest topics.
4. Export your scorecard as a PDF or revisit past sessions at any time from your **Dashboard** (`/dashboard`).

---

## 🧠 AI Engine Options (Zero-Cost Local vs Cloud BYOK)

| Engine Option | API Key Required? | Cost | Internet Required? | Best For |
| :--- | :---: | :---: | :---: | :--- |
| **Antigravity AI Sub-Agent** | ❌ No | **Free ($0)** | Optional | Local offline development, instant testing, zero setup friction |
| **Local Ollama** | ❌ No | **Free ($0)** | ❌ Completely Offline | Privacy-first local testing with Llama 3.2, DeepSeek-R1, Mistral |
| **Cloud BYOK (OpenAI)** | ✔ Yes (User Key) | Pay per token | ✔ Yes | GPT-4o / GPT-4o-mini cutting edge reasoning |
| **Cloud BYOK (Gemini)** | ✔ Yes (User Key) | Free tier / Pay per token | ✔ Yes | Gemini 1.5 Pro / Flash high-speed multimodal capabilities |
| **Cloud BYOK (Groq)** | ✔ Yes (User Key) | Free tier / Pay per token | ✔ Yes | Ultra-low latency inference (300+ tokens/sec) |
| **Cloud BYOK (Grok / Claude)** | ✔ Yes (User Key) | Pay per token | ✔ Yes | Deep technical nuance and architectural debate |

---

## 🛠️ Installation & Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or v20+ (v22 recommended)
- **Package Manager**: `npm` (or `pnpm` / `yarn`)
- **PostgreSQL**: PostgreSQL database (or free [Supabase](https://supabase.com) project)
- **Modern Browser**: Google Chrome, Microsoft Edge, Brave, or Safari with Web Speech API support

### 1. Clone the Repository
```bash
git clone https://github.com/Paurushmuley/AI-Interviewer-Agent-Application.git
cd AI-Interviewer-Agent-Application
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (or copy `.env.example`):
```bash
cp .env.example .env
```

Set the following variables:
```env
# Database Connections (Supabase / PostgreSQL)
POSTGRES_PRISMA_URL="postgres://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgres://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"

# Auth Secret & Master Encryption Key
JWT_SECRET="generate-a-random-32-byte-secret"
ENCRYPTION_MASTER_KEY="generate-a-32-byte-hex-key"

# App & Local Sub-Agent Endpoints
NEXT_PUBLIC_APP_URL="http://localhost:5000"
OLLAMA_BASE_URL="http://127.0.0.1:11434"
```

> [!TIP]
> Generate your 32-byte hex `ENCRYPTION_MASTER_KEY` instantly with Node:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 4. Push Database Schema
Synchronize the Prisma schema with your PostgreSQL database:
```bash
npx prisma db push
```

### 5. Launch the Development Server
```bash
npx next dev -p 5000
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser!

---

## 📊 Interactive Feature Matrix

| Feature | Description | Status |
| :--- | :--- | :---: |
| **Arohi Voice Engine** | Articulate Indian English TTS with natural 1.12x conversational pace and fallback hierarchy | ✅ Active |
| **Reactive Lip-Sync Avatar** | Dynamic SVG jaw & mouth displacement synchronized to spoken audio amplitudes | ✅ Active |
| **Hands-Free Two-Way Voice** | Full duplex speech: AI auto-mutes mic during speech, auto-unmutes on completion, 2.1s pause detection | ✅ Active |
| **Speech NLP HUD** | Live WPM cadence tracker, verbal filler counter, spoken confidence scorer | ✅ Active |
| **Live Code Workspace** | In-browser multi-language editor (JS, TS, Python) with test case execution & complexity grading | ✅ Active |
| **100% Answer Scorecard** | Question-by-question breakdown, candidate quotes, L5/L6 senior benchmarks, 4-week roadmap | ✅ Active |
| **Lexical Repetition Analyzer** | Type-Token Ratio (TTR) diversity calculation and crutch term repetition tracking | ✅ Active |
| **Instant Conclude Modal** | Confirmation tab preventing accidental clicks with instant termination of audio and mic | ✅ Active |
| **Mobile 3-Tab Switcher** | Responsive Video, Coding, and Transcript tabs optimized for touch and `100dvh` | ✅ Active |
| **Multi-LLM BYOK** | OpenAI, Gemini, Groq, Grok, Claude encrypted with AES-256-GCM | ✅ Active |
| **Zero-Cost Sub-Agent** | Local autonomous interview driver requiring zero external tokens or keys | ✅ Active |

---

## 🛡️ Security & AES-256-GCM Encryption

Candidate privacy and API key security are top priorities:
1. **AES-256-GCM Authenticated Encryption**:
   - When you save an API key on the Setup or Dashboard page, it is encrypted using **AES-256-GCM**.
   - Every encrypted key stores a unique 96-bit Initialization Vector (`iv`) and 128-bit authentication tag (`tag`).
   - Plaintext keys are never stored in the database, never exposed in client bundles, and never logged to stdout/stderr.
2. **Stateless JWT Sessions**:
   - Auth tokens are signed with HMAC SHA-256 and stored in secure, `httpOnly`, `SameSite=Lax` browser cookies.
   - Passwords are salted and hashed using `bcryptjs` with standard 12 salt rounds.
3. **Local Engine Privacy**:
   - With the **Antigravity Sub-Agent** and **Local Ollama**, your resume, answers, and code stay 100% local on your machine.

---

## 🧪 Automated Verification Suite

Run the full end-to-end automated test suite to verify cryptographic, NLP, parsing, and engine integrity:

```bash
npx tsx scripts/verify-core.ts
```

This verifies:
- ✔ **AES-256-GCM Encryption / Decryption**: Validates cipher round-trip, unique IV randomness, and auth tag verification.
- ✔ **Speech NLP Analyzer**: Tests filler word extraction (*"um"*, *"basically"*), WPM calculation, and confidence scoring.
- ✔ **Resume Parser & JD Alignment**: Tests PDF/DOCX entity extraction, tech stack discovery, and gap detection.
- ✔ **Antigravity AI Sub-Agent**: Validates question generation, conversational pacing, and code grading.
- ✔ **Ollama Health Check**: Pings local Ollama daemon and enumerates available offline models.

---

## 🚢 Deployment (Vercel + Supabase)

1. **Push your repository** to GitHub.
2. **Import into Vercel**: Connect your GitHub repository in the [Vercel Dashboard](https://vercel.com).
3. **Configure Environment Variables** in Vercel Project Settings:
   - `POSTGRES_PRISMA_URL` (Supabase pooled connection string)
   - `POSTGRES_URL_NON_POOLING` (Supabase direct connection string)
   - `JWT_SECRET` (Secure 32+ character random secret)
   - `ENCRYPTION_MASTER_KEY` (64-character hex key)
   - `NEXT_PUBLIC_APP_URL` (Your production Vercel URL, e.g. `https://your-app.vercel.app`)
4. **Attach Vercel Blob Storage** (Storage tab) for fast cloud resume storage.
5. Click **Deploy**!

> [!NOTE]
> On deployed production environments, the **Antigravity Sub-Agent** and **Local Ollama** engines are automatically disabled, gracefully directing users to Cloud BYOK (OpenAI, Gemini, Groq, Claude) to protect local server resources.

---

<div align="center">

**Built with passion for engineers aiming for interview excellence.**  
*Master technical interviews with confidence, clarity, and realism.*

</div>
