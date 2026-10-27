export type LLMProvider =
  | 'antigravity'
  | 'ollama'
  | 'openai'
  | 'gemini'
  | 'groq'
  | 'grok'
  | 'anthropic'
  | 'local'; // Backward compatibility alias for antigravity

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface InterviewTurnContext {
  roleTitle: string;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  interviewStage: 'intro' | 'experience_deepdive' | 'coding_challenge' | 'system_design' | 'behavioral' | 'wrap_up';
  remainingMinutes: number;
  totalDurationMinutes: number;
  jobDescription: string;
  candidateSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  lastCandidateMetrics?: {
    wpm: number;
    fillerCount: number;
    confidenceScore: number;
  };
}

export interface LLMResponse {
  content: string;
  stageTransition?: 'continue' | 'next_stage' | 'wrap_up';
  codingChallenge?: {
    title: string;
    description: string;
    starterCode: string;
    expectedLanguage: string;
    testCases: Array<{ input: string; expectedOutput: string }>;
  };
}
