'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Send,
  Clock,
  Sparkles,
  Award,
  Code2,
  Video,
  MessageSquare,
  AlertTriangle,
  StopCircle,
  Volume2,
} from 'lucide-react';
import { AiAvatar } from '@/components/avatar/AiAvatar';
import { CandidateCam } from '@/components/camera/CandidateCam';
import { CodeWorkspace } from '@/components/coding/CodeWorkspace';
import { SpeechMetricsBadge } from '@/components/nlp/SpeechMetricsBadge';
import { SpeechMetrics } from '@/lib/nlp/speech-analyzer';

export default function InterviewRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: interviewId } = use(params);

  // Interview state
  const [interview, setInterview] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Time & Pacing state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1800); // 30 mins default
  const [timerActive, setTimerActive] = useState(true);

  // Media & Interaction states
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [candidateInput, setCandidateInput] = useState('');
  const [lastMetrics, setLastMetrics] = useState<SpeechMetrics | null>(null);
  const [turnStartTime, setTurnStartTime] = useState<number>(Date.now());

  // Coding Workspace State
  const [activeTab, setActiveTab] = useState<'video' | 'coding'>('video');
  const [codingChallenge, setCodingChallenge] = useState<any | null>(null);

  // Speech Recognition ref
  const recognitionRef = useRef<any | null>(null);

  // 1. Fetch Interview Data & Initial Message
  useEffect(() => {
    async function loadInterview() {
      try {
        const res = await fetch(`/api/interview/${interviewId}`);
        const data = await res.json();
        if (data.success) {
          setInterview(data.interview);
          setMessages(data.interview.messages || []);
          setSecondsRemaining((data.interview.targetDurationMinutes || 30) * 60);

          if (data.interview.codingSubmissions && data.interview.codingSubmissions.length > 0) {
            setCodingChallenge(data.interview.codingSubmissions[0]);
          }

          // Speak initial interviewer message if available
          const firstMsg = data.interview.messages?.[0]?.content;
          if (firstMsg) {
            speakText(firstMsg);
          }
        }
      } catch (err) {
        console.error('Failed to load interview:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInterview();
  }, [interviewId]);

  // 2. Timer Countdown Engine
  useEffect(() => {
    if (!timerActive || secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, secondsRemaining]);

  // Format seconds to MM:SS
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 3. Browser Speech Synthesis (Text-To-Speech) with Lip-Sync
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      setIsAiSpeaking(true);
      setIsAiThinking(false);
    };

    utterance.onend = () => {
      setIsAiSpeaking(false);
      setTurnStartTime(Date.now()); // Mark start of candidate turn
    };

    utterance.onerror = () => {
      setIsAiSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // 4. Browser Speech-To-Text (STT) Setup
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. You can type your response in the text field.');
      return;
    }

    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    // Start recording
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript + ' ';
      }
      setCandidateInput(fullTranscript.trim());
    };

    recognition.onerror = (err: any) => {
      console.warn('Speech recognition error:', err);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setTurnStartTime(Date.now());
  };

  // 5. Submit Candidate Turn to AI Interviewer
  const handleSendTurn = async () => {
    const textToSend = candidateInput.trim();
    if (!textToSend) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const durationSeconds = Math.max(5, Math.round((Date.now() - turnStartTime) / 1000));
    const remainingMins = Math.round(secondsRemaining / 60);

    // Optimistically update UI
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      sender: 'candidate',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setCandidateInput('');
    setIsAiThinking(true);

    try {
      const res = await fetch(`/api/interview/${interviewId}/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateTranscript: textToSend,
          durationSeconds,
          remainingMinutes: remainingMins,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit response.');
      }

      // Update metrics
      if (data.candidateMetrics) {
        setLastMetrics(data.candidateMetrics);
      }

      // Update Coding challenge if initiated
      if (data.codingChallenge) {
        setCodingChallenge(data.codingChallenge);
        setActiveTab('coding'); // Auto switch to coding editor when problem arrives!
      }

      // Add Agent Message
      if (data.agentMessage) {
        setMessages(prev => [...prev, data.agentMessage]);
        speakText(data.agentMessage.content);
      }
    } catch (err) {
      console.error('Error submitting turn:', err);
      setIsAiThinking(false);
    }
  };

  // 6. Finish Interview & View Report
  const handleFinishInterview = async () => {
    setTimerActive(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    try {
      const res = await fetch(`/api/interview/${interviewId}/evaluate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        router.push(`/report/${interviewId}`);
      }
    } catch {
      router.push(`/report/${interviewId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <Sparkles className="w-5 h-5 text-blue-500 animate-spin" />
          <span>Setting up secure interview session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-3 sm:px-6 py-4 w-full overflow-hidden">
      {/* Top Session Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            {interview?.roleTitle}
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            {interview?.experienceLevel} Level •{' '}
            {interview?.llmProvider === 'antigravity' || interview?.llmProvider === 'local'
              ? 'Antigravity AI Sub-Agent Assigned'
              : interview?.llmProvider === 'ollama'
              ? `Ollama Local (${interview?.llmModel || 'llama3.2'})`
              : `Multi-LLM BYOK (${interview?.llmProvider?.toUpperCase()})`}
          </span>
        </div>

        {/* View Switcher Tabs (Video Conference vs Live Code Editor) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'video' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Call</span>
          </button>

          <button
            onClick={() => setActiveTab('coding')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'coding' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Live Code Editor</span>
            {codingChallenge && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
          </button>
        </div>

        {/* Timer & Finish Button */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              secondsRemaining < 300
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={handleFinishInterview}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-md shadow-rose-600/20"
          >
            <StopCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">End & Evaluate</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 py-3 overflow-hidden min-h-0">
        {/* Left Column: Video Room or Coding Workspace (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3 h-full overflow-hidden">
          {activeTab === 'video' ? (
            /* Split Screen Video Call: AI Avatar on Left + Candidate WebCam on Right */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0">
              <AiAvatar
                isSpeaking={isAiSpeaking}
                isThinking={isAiThinking}
                interviewerName={
                  interview?.llmProvider === 'antigravity' || interview?.llmProvider === 'local'
                    ? 'Sophia (Antigravity AI Sub-Agent)'
                    : interview?.llmProvider === 'ollama'
                    ? `Sophia (Ollama • ${interview?.llmModel || 'Local Model'})`
                    : `Sophia (${interview?.llmProvider?.toUpperCase()} • BYOK)`
                }
              />
              <CandidateCam candidateName="You (Candidate)" isRecording={isRecording} />
            </div>
          ) : (
            /* Coding Profile Workspace */
            <div className="flex-1 min-h-0">
              <CodeWorkspace
                interviewId={interviewId}
                problemTitle={codingChallenge?.problemTitle || 'Live Technical Coding Challenge'}
                problemStatement={
                  codingChallenge?.problemStatement ||
                  'The interviewer will assign a coding problem tailored to your JD and experience level during this round.'
                }
                starterCode={codingChallenge?.starterCode}
                expectedLanguage={codingChallenge?.language || 'javascript'}
                testCases={codingChallenge?.testResults || []}
              />
            </div>
          )}

          {/* Bottom Bar: Real-time NLP Metrics & Speech Input */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            {/* Live NLP Metrics Badges */}
            <div className="flex items-center justify-between">
              <SpeechMetricsBadge metrics={lastMetrics} />
              {isAiSpeaking && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Audio lip-sync active
                </span>
              )}
            </div>

            {/* Answer Input Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-3 rounded-xl font-medium text-xs flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
                title={isRecording ? 'Stop speaking and send' : 'Speak your answer (Speech-to-Text)'}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-blue-400" />}
              </button>

              <input
                type="text"
                value={candidateInput}
                onChange={e => setCandidateInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendTurn()}
                placeholder={isRecording ? 'Listening to your voice...' : 'Type or speak your answer...'}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={handleSendTurn}
                disabled={!candidateInput.trim() || isAiThinking}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20 shrink-0"
              >
                {isAiThinking ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Send Turn</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interview Transcript History (4 cols) */}
        <div className="lg:col-span-4 flex flex-col h-full rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Live Transcript
            </span>
            <span className="text-[11px] text-slate-400">{messages.length} messages</span>
          </div>

          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`p-3 rounded-xl text-xs leading-relaxed ${
                  msg.sender === 'agent'
                    ? 'bg-blue-950/40 border border-blue-500/20 text-slate-200'
                    : msg.sender === 'system'
                    ? 'bg-purple-950/30 border border-purple-500/20 text-purple-200 italic'
                    : 'bg-slate-950 border border-slate-800 text-slate-100 ml-4'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-semibold uppercase">
                  <span>{msg.sender === 'agent' ? 'AI Interviewer' : msg.sender === 'system' ? 'System' : 'You'}</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
