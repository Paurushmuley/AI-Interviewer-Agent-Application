'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Upload,
  FileText,
  Clock,
  Briefcase,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Bot,
  Zap,
} from 'lucide-react';

export default function InterviewSetupPage() {
  const router = useRouter();

  // Form State
  const [roleTitle, setRoleTitle] = useState('Senior Full-Stack Engineer');
  const [experienceLevel, setExperienceLevel] = useState<'Entry' | 'Mid' | 'Senior' | 'Lead'>('Senior');
  const [interviewType, setInterviewType] = useState('full_loop');
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(30);
  const [customDuration, setCustomDuration] = useState('');
  const [jobDescription, setJobDescription] = useState(`We are looking for a Senior Full-Stack Engineer to lead the architecture of our cloud-native applications.
Key Requirements:
- 5+ years experience with TypeScript, React, Next.js, and Node.js.
- Strong proficiency with PostgreSQL, Prisma/Drizzle, and database optimization.
- Experience building scalable REST/GraphQL APIs and microservices.
- Excellent algorithmic problem-solving and system design skills.
- Understanding of CI/CD pipelines, Docker, and cloud deployments (AWS/Vercel).`);

  // Resume Upload State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);

  // LLM Provider & BYOK State
  const [provider, setProvider] = useState<'antigravity' | 'ollama' | 'openai' | 'gemini' | 'groq' | 'grok' | 'anthropic'>('antigravity');
  const [ollamaModel, setOllamaModel] = useState('llama3.2');
  const [apiKey, setApiKey] = useState('');
  const [verifyingKey, setVerifyingKey] = useState(false);
  const [keyVerificationMsg, setKeyVerificationMsg] = useState<{ valid: boolean; text: string } | null>(null);

  // User State
  const [user, setUser] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {}
    }
    checkAuth();
  }, []);

  // Handle Resume File Upload & Parsing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('jd', jobDescription);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload resume.');
      }

      setUploadResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Test BYOK Key or Ollama Connection
  const handleVerifyKey = async () => {
    if (provider !== 'ollama' && provider !== 'antigravity' && !apiKey.trim()) return;
    setVerifyingKey(true);
    setKeyVerificationMsg(null);

    try {
      const res = await fetch('/api/keys/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: apiKey.trim() }),
      });

      const data = await res.json();
      setKeyVerificationMsg({ valid: data.valid, text: data.message });
    } catch (err: any) {
      setKeyVerificationMsg({ valid: false, text: err.message });
    } finally {
      setVerifyingKey(false);
    }
  };

  // Handle Launching Interview
  const handleStartInterview = async () => {
    setError(null);
    setSubmitting(true);

    const effectiveDuration = customDuration ? parseInt(customDuration, 10) : targetDurationMinutes;

    try {
      // If user supplied an external provider key, save it
      if (provider !== 'antigravity' && provider !== 'ollama' && apiKey.trim()) {
        await fetch('/api/keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, apiKey: apiKey.trim() }),
        });
      }

      const res = await fetch('/api/interview/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleTitle,
          experienceLevel,
          interviewType,
          targetDurationMinutes: effectiveDuration,
          jobDescription,
          resumeBlobUrl: uploadResult?.blobUrl,
          resumeFilename: uploadResult?.filename,
          parsedResume: uploadResult?.parsedResume,
          llmProvider: provider,
          llmModel: provider === 'ollama' ? ollamaModel : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create interview session.');
      }

      // Route to live interview room!
      router.push(`/interview/${data.interviewId}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Interview Wizard</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Configure Your Practice Session</h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Tailor the role, session duration, and AI provider. Upload your resume for real-time NLP alignment.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
        {/* Step 1: Role & Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">Target Job Title</label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={roleTitle}
                onChange={e => setRoleTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">Seniority Level</label>
            <select
              value={experienceLevel}
              onChange={e => setExperienceLevel(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="Entry">Entry Level (0 - 2 years)</option>
              <option value="Mid">Mid-Level (2 - 5 years)</option>
              <option value="Senior">Senior Level (5 - 8 years)</option>
              <option value="Lead">Staff / Principal / Lead (8+ years)</option>
            </select>
          </div>
        </div>

        {/* Step 2: Configurable Interview Duration (User Selected Time: 15 / 30 / 45 / 60 min) */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Interview Session Duration</span>
            </span>
            <span className="text-[11px] text-slate-400">Paces questions according to remaining time</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[15, 30, 45, 60].map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => {
                  setTargetDurationMinutes(mins);
                  setCustomDuration('');
                }}
                className={`py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${
                  targetDurationMinutes === mins && !customDuration
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-base font-bold text-white">{mins} mins</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {mins === 15 ? 'Speed Screening' : mins === 30 ? 'Standard Tech' : mins === 45 ? 'Deep Dive' : 'Full Loop'}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-xs text-slate-400">Or custom duration:</span>
            <input
              type="number"
              min={10}
              max={120}
              value={customDuration}
              onChange={e => {
                setCustomDuration(e.target.value);
                if (e.target.value) setTargetDurationMinutes(parseInt(e.target.value, 10));
              }}
              placeholder="e.g. 40"
              className="w-24 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <span className="text-xs text-slate-400">minutes</span>
          </div>
        </div>

        {/* Step 3: Target Job Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">Job Description (JD)</label>
          <textarea
            rows={5}
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste the target job description here..."
            className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed font-mono"
          />
        </div>

        {/* Step 4: Resume Ingestion & NLP Gap Analysis */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <label className="block text-xs font-semibold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Candidate Resume (PDF or TXT)</span>
            </span>
            <span className="text-[10px] text-slate-400">Temporary Vercel Blob storage</span>
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>{resumeFile ? resumeFile.name : 'Choose Resume File'}</span>
              <input type="file" accept=".pdf,.txt,.docx" onChange={handleFileUpload} className="hidden" />
            </label>

            {uploading && (
              <span className="text-xs text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Uploading & running NLP parser...
              </span>
            )}
          </div>

          {/* Extracted NLP Skills Matrix Preview */}
          {uploadResult && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-blue-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  NLP Alignment Score with JD:
                </span>
                <span className="font-bold text-emerald-400 text-sm">
                  {uploadResult.jdAlignment?.matchScore ?? 80}% Match
                </span>
              </div>

              {uploadResult.parsedResume?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {uploadResult.parsedResume.skills.slice(0, 10).map((skill: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 5: Multi-LLM BYOK Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-400" />
              <span>Interviewer Intelligence Engine (Multi-LLM BYOK)</span>
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> AES-256-GCM
            </span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {[
              { id: 'antigravity', name: 'Antigravity Sub-Agent', tag: 'Assigned Agent • Free' },
              { id: 'ollama', name: 'Local Ollama', tag: 'localhost:11434' },
              { id: 'openai', name: 'OpenAI (GPT-4o)', tag: 'BYOK' },
              { id: 'gemini', name: 'Google Gemini', tag: 'BYOK' },
              { id: 'groq', name: 'Groq (Llama-3.3)', tag: 'Ultra-Fast' },
              { id: 'grok', name: 'xAI Grok', tag: 'BYOK' },
              { id: 'anthropic', name: 'Anthropic Claude', tag: 'BYOK' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setProvider(item.id as any);
                  setKeyVerificationMsg(null);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === item.id
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-slate-100">{item.name}</div>
                <div className="text-[10px] text-blue-400 mt-0.5">{item.tag}</div>
              </button>
            ))}
          </div>

          {/* Option 1: Antigravity Sub-Agent Banner */}
          {provider === 'antigravity' && (
            <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Antigravity AI Sub-Agent Assigned as Lead Interviewer</p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  The Antigravity backend subagent conducts the full interview session, generates custom coding challenges matched to your JD, evaluates your answers, and scores your performance without requiring any external API key.
                </p>
              </div>
            </div>
          )}

          {/* Option 2: Local Ollama Configuration */}
          {provider === 'ollama' && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">Local Ollama Model (http://127.0.0.1:11434):</span>
                <span className="text-[11px] text-slate-500">Requires local `ollama serve`</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={ollamaModel}
                  onChange={e => setOllamaModel(e.target.value)}
                  placeholder="e.g. llama3.2, deepseek-r1, mistral"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleVerifyKey}
                  disabled={verifyingKey}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold shrink-0"
                >
                  {verifyingKey ? 'Checking...' : 'Ping Ollama'}
                </button>
              </div>

              {keyVerificationMsg && (
                <div
                  className={`text-xs p-2 rounded-lg ${
                    keyVerificationMsg.valid ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                  }`}
                >
                  {keyVerificationMsg.text}
                </div>
              )}
            </div>
          )}

          {/* Option 3: External BYOK Provider Key Input */}
          {provider !== 'antigravity' && provider !== 'ollama' && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">
                  Enter {provider.toUpperCase()} API Key:
                </span>
                <span className="text-[11px] text-slate-500">Will be encrypted & saved</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder={`sk-... (Your ${provider} key)`}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleVerifyKey}
                  disabled={verifyingKey || !apiKey.trim()}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl text-xs font-semibold shrink-0"
                >
                  {verifyingKey ? 'Verifying...' : 'Test Key'}
                </button>
              </div>

              {keyVerificationMsg && (
                <div
                  className={`text-xs p-2 rounded-lg ${
                    keyVerificationMsg.valid ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                  }`}
                >
                  {keyVerificationMsg.text}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Launch Button */}
        <button
          type="button"
          onClick={handleStartInterview}
          disabled={submitting}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Initializing Live Interview Room...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-current" />
              <span>Enter Live Interview Room</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
