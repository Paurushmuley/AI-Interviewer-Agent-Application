import Link from 'next/link';
import {
  Sparkles,
  Bot,
  Video,
  Code2,
  Clock,
  KeyRound,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  Cpu,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Hybrid NLP + LLM Interview Intelligence</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Master Your Next Tech Interview with a{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Hyper-Realistic AI Agent
          </span>
        </h1>

        {/* Description */}
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Upload your Resume and target Job Description. Engage in real-time video interviews with an audio-reactive
          lip-sync AI Avatar, live candidate camera, real-time speech NLP metrics, live coding challenges, and multi-LLM BYOK encryption.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/setup"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <span>Start Practice Interview</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/register"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
          >
            <span>Create Account & Save History</span>
          </Link>
        </div>

        {/* Mini Highlights */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero-Cost Local Dev Sub-Agent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>AES-256-GCM BYOK Encryption</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>15m - 60m Adaptive Pacing</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Engineered for Maximum Realism</h2>
          <p className="text-sm text-slate-400 mt-2">
            Combining traditional Natural Language Processing with cutting-edge Large Language Models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: Avatar & Video */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-blue-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Lip-Sync AI Avatar & WebCam</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Experience a natural face-to-face video call with an AI interviewer whose lip movement dynamically syncs to spoken audio, paired with your real-time candidate camera preview.
            </p>
          </div>

          {/* Feature 2: Speech NLP */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Real-Time Speech NLP Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Continuous detection of filler words (*&quot;um&quot;, &quot;like&quot;, &quot;you know&quot;*), words-per-minute (WPM) pacing evaluation, and speech confidence scoring on every spoken turn.
            </p>
          </div>

          {/* Feature 3: Live Coding */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-purple-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">JD-Calibrated Live Coding</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Coding profile interviews present live algorithmic and architectural challenges calibrated directly to your seniority level with automated test execution and complexity grading.
            </p>
          </div>

          {/* Feature 4: Custom Duration */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Configurable Duration (15m - 60m)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select your preferred session length. The dynamic state machine automatically paces questions across icebreakers, deep-dives, coding, and behavioral rounds.
            </p>
          </div>

          {/* Feature 5: Multi-LLM BYOK */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Multi-LLM BYOK with AES-256-GCM</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bring your own key for OpenAI, Google Gemini, Groq, xAI Grok, or Claude. Stored securely with AES-256-GCM encryption and a strict zero-log policy.
            </p>
          </div>

          {/* Feature 6: Dashboard & History */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-rose-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Account History & Scorecards</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create an account to track your progress over time. Revisit past interview sessions, review question-by-question critiques, and inspect actionable tips.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
