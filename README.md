# AI Interviewer Agent Application

An intelligent, multi-provider conversational interview simulation platform. It analyzes a candidate's Resume and target Job Description (JD) using a hybrid **NLP + LLM** pipeline to conduct realistic, context-aware technical, behavioral, and live coding interviews, evaluate candidate performance, and provide actionable scorecards.

---

## 🌟 Key Features

- **Hyper-Realistic Video Call Simulation**:
  - **Audio-Reactive Lip-Sync AI Avatar**: Mouth openness and speech cadences synchronize dynamically to text-to-speech audio with natural eye blinking.
  - **Candidate WebCam Preview**: Live camera and microphone preview simulating a video conference call (Google Meet / Zoom aesthetic).
- **Hybrid Real-Time Speech NLP Analytics**:
  - Live detection of verbal fillers (*"um"*, *"like"*, *"you know"*, *"basically"*).
  - Words-per-minute (WPM) cadence pacing (optimal, hesitant, or rushed).
  - Spoken confidence scoring (0–100%) and strong action verb recognition.
- **In-Browser Live Coding Profile**:
  - Interactive multi-language IDE (JavaScript, TypeScript, Python) with test case execution.
  - Generates algorithmic coding challenges calibrated to candidate seniority level (Entry, Mid, Senior, Lead).
  - Automated code analysis grading correctness, edge-case handling, and algorithmic complexity ($O(N)$, $O(1)$).
- **Configurable Interview Duration (15m – 60m)**:
  - Dynamically paces interview stages: Icebreaker ➔ Experience Deep-Dive ➔ Live Coding ➔ System Design ➔ Wrap-up.
- **Account Management & Historical Scorecards**:
  - User registration, login, and JWT sessions with `bcryptjs` password hashing.
  - Dashboard tracking practice history, average scores, and question-by-question critiques.
- **Multi-LLM BYOK with AES-256-GCM Encryption**:
  - Bring your own API keys for **OpenAI**, **Google Gemini**, **Groq**, **xAI Grok**, or **Anthropic**.
  - All keys are encrypted at rest with AES-256-GCM (unique IV and auth tag) and never logged in plain text.

---

## 🚀 Local Setup & Engine Guide

The platform provides two zero-cost local engines for offline development and testing: **Antigravity AI Sub-Agent** and **Local Ollama**.

> [!NOTE]
> On public/deployed environments (e.g., Vercel), the **Antigravity Sub-Agent** and **Local Ollama** options are automatically disabled to protect local host resources. To use them, clone this repository and run locally!

---

### Option 1: Using the Antigravity AI Sub-Agent (Zero API Key Required)

The **Antigravity AI Sub-Agent** is an autonomous backend agent built directly into the application:

1. **How it works**:
   - Operates in place of external LLMs without requiring external API keys or tokens.
   - Drives multi-stage conversational interview flow based on remaining time.
   - Cross-references your uploaded resume skills against the Job Description to ask probing follow-up questions.
   - Automatically issues, tests, and grades live coding challenges.
   - Generates the final post-interview report and scorecard.
2. **How to use it**:
   - Start the app locally: `npx next dev -p 5000`
   - Navigate to [http://localhost:5000/setup](http://localhost:5000/setup)
   - Under **Interviewer Intelligence Engine**, select **Antigravity Sub-Agent** (selected by default on local).
   - Upload your resume, set your duration, and click **Enter Live Interview Room**!

---

### Option 2: Using Local Ollama (Localhost:11434)

Connect your own open-source local LLMs (e.g. Llama 3.2, DeepSeek-R1, Mistral, Qwen) running on your machine:

1. **Install Ollama**:
   - Download and install from [ollama.com](https://ollama.com).
2. **Start the Ollama daemon**:
   ```bash
   ollama serve
   ```
3. **Download your preferred models**:
   ```bash
   ollama pull llama3.2
   # or
   ollama pull deepseek-r1:1.5b
   ```
4. **Configure in AI Interviewer**:
   - On the setup page ([http://localhost:5000/setup](http://localhost:5000/setup)), click **Local Ollama**.
   - Enter your model name (e.g., `llama3.2` or `deepseek-r1:1.5b`).
   - Click **Ping Ollama** to test connection. You will see a list of detected local models.
   - Launch your interview!

---

### Option 3: Using External BYOK Providers

To use cloud frontier models (OpenAI, Gemini, Groq, xAI Grok, Anthropic):
1. In [http://localhost:5000/setup](http://localhost:5000/setup) or on your [Dashboard](http://localhost:5000/dashboard), select your provider.
2. Enter your API key.
3. Click **Test Key** to verify it before starting.
4. Keys are saved securely in your PostgreSQL database encrypted with AES-256-GCM.

---

## 🛠️ Installation & Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Paurushmuley/AI-Interviewer-Agent-Application.git
cd AI-Interviewer-Agent-Application
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure your `.env` contains:
```env
# Database Connections (Supabase / PostgreSQL)
POSTGRES_PRISMA_URL="postgres://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgres://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"

# Auth & Encryption
JWT_SECRET="generate-a-random-32-byte-secret"
ENCRYPTION_MASTER_KEY="generate-a-32-byte-hex-key"

# App & Local Sub-Agent
NEXT_PUBLIC_APP_URL="http://localhost:5000"
OLLAMA_BASE_URL="http://127.0.0.1:11434"
```

To generate a secure 32-byte hex key for `ENCRYPTION_MASTER_KEY`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Initialize Database Schema
Push the schema to your PostgreSQL / Supabase database:
```bash
npx prisma db push
```

### 5. Run the Local Development Server
```bash
npx next dev -p 5000
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 🧪 Verification & Testing Suite

Run the automated subsystem test suite:
```bash
npx tsx scripts/verify-core.ts
```
Verifies:
- ✔ AES-256-GCM Encryption / Decryption round-trip
- ✔ Real-time speech NLP filler detection, WPM, and confidence scoring
- ✔ Resume NLP parser and Job Description gap alignment
- ✔ Antigravity AI Sub-Agent turn generation and coding challenge grading
- ✔ Ollama daemon health-check and model detection

---

## 🚢 Vercel Deployment

1. Import the repository into your [Vercel Dashboard](https://vercel.com).
2. Attach **Vercel Blob** in the Storage tab.
3. Configure the following environment variables in Vercel Project Settings:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `JWT_SECRET`
   - `ENCRYPTION_MASTER_KEY`
   - `BLOB_READ_WRITE_TOKEN` (Auto-configured if Vercel Blob is attached)
   - `NEXT_PUBLIC_APP_URL` (Set to your deployed Vercel domain)
4. Deploy!
