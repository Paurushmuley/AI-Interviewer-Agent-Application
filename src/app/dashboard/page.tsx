'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  KeyRound,
  History,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  ExternalLink,
  Code2,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // BYOK modal / form state
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini' | 'groq' | 'grok' | 'anthropic'>('openai');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [keyStatusMsg, setKeyStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch current user
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);

        // 2. Fetch history
        const histRes = await fetch('/api/dashboard/history');
        if (histRes.ok) {
          const histData = await histRes.json();
          setHistory(histData.interviews || []);
          setStats(histData.stats || null);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setSavingKey(true);
    setKeyStatusMsg(null);

    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey: apiKeyInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to encrypt and save key.');
      }

      setKeyStatusMsg({ type: 'success', text: data.message });
      setApiKeyInput('');

      // Refresh user keys
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }
    } catch (err: any) {
      setKeyStatusMsg({ type: 'error', text: err.message });
    } finally {
      setSavingKey(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <Sparkles className="w-5 h-5 text-blue-500 animate-spin" />
          <span>Loading your interview dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>Welcome back, {user?.name || 'Candidate'}!</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Account Email: <span className="text-slate-200">{user?.email}</span> • Practice History & Security
          </p>
        </div>

        <Link
          href="/setup"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Start New Interview</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
            <History className="w-4 h-4 text-blue-400" />
            <span>Interviews Taken</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.totalInterviews || 0}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Average Score</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {stats?.avgScore ? `${stats.avgScore}%` : 'N/A'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Best Score</span>
          </div>
          <div className="text-2xl font-bold text-indigo-300">
            {stats?.highestScore ? `${stats.highestScore}%` : 'N/A'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Practice Time</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.totalMinutes || 0} mins</div>
        </div>
      </div>

      {/* BYOK API Key Encryption Manager */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Multi-LLM BYOK Key Management (AES-256-GCM Encrypted)</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted at Rest</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Provide your API keys to unlock external LLM models (OpenAI, Gemini, Groq, xAI Grok, Anthropic). Your keys are encrypted using AES-256-GCM before being stored in PostgreSQL and never exposed in logs.
        </p>

        {/* Configured Keys Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {['openai', 'gemini', 'groq', 'grok', 'anthropic'].map(prov => {
            const isConfigured = user?.keys?.some((k: any) => k.provider === prov);
            return (
              <span
                key={prov}
                className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                  isConfigured
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                }`}
              >
                {isConfigured ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <KeyRound className="w-3.5 h-3.5 opacity-50" />}
                <span className="uppercase">{prov}</span>
                <span className="text-[10px] opacity-75">{isConfigured ? 'Active' : 'Unset'}</span>
              </span>
            );
          })}
        </div>

        {/* Key Input Form */}
        <form onSubmit={handleSaveKey} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <select
            value={selectedProvider}
            onChange={e => setSelectedProvider(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
          >
            <option value="openai">OpenAI (GPT-4o)</option>
            <option value="gemini">Google Gemini (1.5 Flash / Pro)</option>
            <option value="groq">Groq (Llama-3.3-70B)</option>
            <option value="grok">xAI Grok (Grok-2)</option>
            <option value="anthropic">Anthropic (Claude 3.5)</option>
          </select>

          <input
            type="password"
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
            placeholder={`Enter your ${selectedProvider.toUpperCase()} API key...`}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={savingKey || !apiKeyInput.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            {savingKey ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>Encrypt & Save Key</span>
          </button>
        </form>

        {keyStatusMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              keyStatusMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}
          >
            {keyStatusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{keyStatusMsg.text}</span>
          </div>
        )}
      </div>

      {/* Past Interview Results History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Interview Practice History</h2>
          </div>
          <span className="text-xs text-slate-400">{history.length} session(s) recorded</span>
        </div>

        {history.length === 0 ? (
          <div className="text-center p-12 rounded-2xl bg-slate-900/30 border border-slate-800/60 text-slate-400 space-y-3">
            <p className="text-sm">No interviews recorded yet.</p>
            <Link
              href="/setup"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg"
            >
              Take Your First Interview
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map(item => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                      {item.experienceLevel} Level
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{item.roleTitle}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {item.targetDurationMinutes} mins
                    </span>
                    <span>•</span>
                    <span className="uppercase text-[11px]">{item.llmProvider}</span>
                  </div>
                </div>

                {/* Score Breakdown */}
                {item.score !== null ? (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Overall Score</span>
                      <span className="font-bold text-emerald-400 text-sm">{item.score}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-900">
                      <span className="text-slate-400">Tech: <b className="text-slate-200">{item.technicalScore || 'N/A'}%</b></span>
                      <span className="text-slate-400">Coding: <b className="text-slate-200">{item.codingScore || 'N/A'}%</b></span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-amber-400/90 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>In progress / Unscored</span>
                  </div>
                )}

                <div className="pt-2">
                  {item.status === 'completed' ? (
                    <Link
                      href={`/report/${item.id}`}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>View Full Evaluation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href={`/interview/${item.id}`}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Resume Interview</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
