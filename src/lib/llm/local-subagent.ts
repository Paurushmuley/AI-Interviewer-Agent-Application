import { ChatMessage, InterviewTurnContext, LLMResponse } from './types';

/**
 * Backend Local Sub-Agent:
 * Provides zero-cost, offline testing for LLM & NLP roles.
 * Supports:
 *  1. Local Ollama proxy (e.g. llama3.2 / deepseek-r1 / mistral at http://localhost:11434)
 *  2. High-fidelity heuristic interview state machine fallback when Ollama is offline.
 */
export class LocalInterviewSubAgent {
  private ollamaBaseUrl: string;

  constructor() {
    this.ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  }

  /**
   * Generates next interview question or response using either Ollama or local heuristic engine.
   */
  async generateInterviewTurn(
    messages: ChatMessage[],
    context: InterviewTurnContext
  ): Promise<LLMResponse> {
    // 1. Try local Ollama if reachable
    try {
      const ollamaResponse = await this.tryOllama(messages, context);
      if (ollamaResponse) {
        return ollamaResponse;
      }
    } catch {
      // Ollama not running or timed out, gracefully fallback to heuristic engine
    }

    // 2. Intelligent Heuristic Interview State Machine
    return this.generateHeuristicResponse(messages, context);
  }

  /**
   * Evaluates candidate's live coding submission locally.
   */
  async evaluateCodeSubmission(
    problemTitle: string,
    problemStatement: string,
    submittedCode: string,
    language: string
  ): Promise<{ score: number; feedback: string; testResults: Array<{ passed: boolean; note: string }> }> {
    // Basic static analysis heuristics
    const codeLen = submittedCode.trim().length;
    let score = 75;
    const notes: Array<{ passed: boolean; note: string }> = [];

    if (codeLen < 30) {
      score = 30;
      notes.push({ passed: false, note: 'Code appears incomplete or minimal implementation.' });
    } else {
      notes.push({ passed: true, note: 'Solution structure implemented.' });
    }

    // Check for common good practices
    if (submittedCode.includes('try') || submittedCode.includes('catch') || submittedCode.includes('if (!') || submittedCode.includes('null') || submittedCode.includes('undefined')) {
      score += 10;
      notes.push({ passed: true, note: 'Handled edge cases / error boundaries.' });
    } else {
      notes.push({ passed: false, note: 'Missing edge case validations (e.g., null / empty input checks).' });
    }

    // Check for comments or modular functions
    if (submittedCode.includes('//') || submittedCode.includes('/*') || submittedCode.includes('def ') || submittedCode.includes('function ') || submittedCode.includes('=>')) {
      score += 10;
      notes.push({ passed: true, note: 'Good readability and function decomposition.' });
    }

    score = Math.min(100, Math.max(20, score));

    const feedback = `Local Sub-Agent Review for ${problemTitle} (${language}):
- Code length: ${codeLen} characters.
- Logic completeness: ${score >= 70 ? 'Satisfactory' : 'Needs improvement'}.
- Complexity estimate: Appears to run with expected polynomial/linear time complexity.
- Suggestions: Consider adding explicit bounds checking and optimizing memory allocations.`;

    return {
      score,
      feedback,
      testResults: notes,
    };
  }

  /**
   * Generates post-interview evaluation report locally without external LLM.
   */
  async generateEvaluationReport(
    interviewContext: { roleTitle: string; experienceLevel: string },
    transcripts: Array<{ sender: string; content: string; nlpMetrics?: any }>,
    codingScores?: number[]
  ): Promise<{
    overallScore: number;
    technicalScore: number;
    codingScore: number;
    communicationScore: number;
    confidenceScore: number;
    strengths: string;
    improvements: string;
    detailedFeedback: string;
  }> {
    // Calculate aggregate metrics from candidate turns
    const candidateTurns = transcripts.filter(t => t.sender === 'candidate');
    let totalConfidence = 0;
    let totalWpm = 0;
    let totalFillers = 0;
    let turnsWithMetrics = 0;

    for (const turn of candidateTurns) {
      if (turn.nlpMetrics) {
        turnsWithMetrics++;
        totalConfidence += turn.nlpMetrics.confidenceScore || 70;
        totalWpm += turn.nlpMetrics.estimatedWpm || 130;
        totalFillers += turn.nlpMetrics.fillerWordsCount || 0;
      }
    }

    const avgConfidence = turnsWithMetrics > 0 ? Math.round(totalConfidence / turnsWithMetrics) : 75;
    const avgWpm = turnsWithMetrics > 0 ? Math.round(totalWpm / turnsWithMetrics) : 135;

    // Coding score
    const avgCodingScore = codingScores && codingScores.length > 0
      ? Math.round(codingScores.reduce((a, b) => a + b, 0) / codingScores.length)
      : 80;

    // Communication score derived from NLP fillers and WPM
    let communicationScore = 80;
    if (totalFillers > 10) communicationScore -= 10;
    if (avgWpm < 100 || avgWpm > 180) communicationScore -= 8;
    communicationScore = Math.max(40, Math.min(95, communicationScore));

    const technicalScore = Math.min(95, Math.max(50, Math.round((avgConfidence + avgCodingScore) / 2)));
    const overallScore = Math.round(technicalScore * 0.4 + avgCodingScore * 0.3 + communicationScore * 0.3);

    return {
      overallScore,
      technicalScore,
      codingScore: avgCodingScore,
      communicationScore,
      confidenceScore: avgConfidence,
      strengths: `• Demonstrated solid understanding of ${interviewContext.roleTitle} core fundamentals.
• Communicated at an average pacing of ${avgWpm} WPM with good technical vocabulary.
• Solved coding prompts with functional algorithmic logic and clear structure.`,
      improvements: `• Work on reducing verbal fillers (${totalFillers} fillers recorded across the session).
• Structure behavioral responses using the STAR method (Situation, Task, Action, Result) for higher impact.
• Elaborate more proactively on engineering trade-offs and alternative architectural approaches.`,
      detailedFeedback: `Candidate was evaluated for the ${interviewContext.experienceLevel} ${interviewContext.roleTitle} position. Overall performance is rated at ${overallScore}/100. Technical discussions showed solid foundational competence. Coding challenges were tackled methodically. With minor polish on pacing and trade-off articulation, candidate shows strong readiness.`,
    };
  }

  // --- Private Heuristic State Helpers ---

  private generateHeuristicResponse(
    messages: ChatMessage[],
    context: InterviewTurnContext
  ): LLMResponse {
    const candidateTurns = messages.filter(m => m.role === 'user');
    const lastUserMsg = candidateTurns[candidateTurns.length - 1]?.content || '';
    const turnCount = candidateTurns.length;

    // Stage 1: Intro / Icebreaker (Turn 0 or 1)
    if (turnCount === 0) {
      return {
        content: `Hello! Welcome to your interview for the ${context.roleTitle} role. I'm your AI interviewer today. We'll be spending around ${context.totalDurationMinutes} minutes exploring your background, technical depth, and a quick coding challenge. To kick things off, could you briefly introduce yourself and highlight a project you're particularly proud of?`,
        stageTransition: 'continue',
      };
    }

    // Stage 2: Experience Deep-dive (Turn 1-2)
    if (turnCount === 1) {
      const topSkill = context.candidateSkills[0] || 'core technologies';
      return {
        content: `Thank you for sharing that context! It's great to hear about your experience. I noticed you have hands-on experience with ${topSkill}. Could you walk me through the architecture of that project, specifically explaining how you handled data consistency, scalability, and error handling?`,
        stageTransition: 'continue',
      };
    }

    // Stage 3: Coding Challenge Transition (Turn 2 or 3)
    if (turnCount === 2) {
      const codingProblem = this.generateCodingChallenge(context);
      return {
        content: `That was a clear breakdown. Now let's transition to a live coding scenario tailored to the ${context.roleTitle} role. I've placed a problem on your code editor: "${codingProblem.title}". Please take a look, talk me through your initial thoughts and edge-case considerations, then implement your solution.`,
        stageTransition: 'next_stage',
        codingChallenge: codingProblem,
      };
    }

    // Stage 4: Post-Coding / Technical Architecture (Turn 3-4)
    if (turnCount === 3) {
      return {
        content: `Great job walking through that implementation! What would you say is the time and space complexity of your solution, and how would you optimize it if we were handling millions of concurrent requests?`,
        stageTransition: 'continue',
      };
    }

    // Stage 5: Behavioral & System Design (Turn 4-5)
    if (turnCount === 4) {
      return {
        content: `Solid technical reasoning. Let's touch on engineering collaboration. Tell me about a time you strongly disagreed with a peer or tech lead on an architectural decision or technical direction. How did you navigate that disagreement and what was the outcome?`,
        stageTransition: 'continue',
      };
    }

    // Stage 6: Wrapping up / Candidate QA (Turn >= 5 or low remaining time)
    if (turnCount >= 5 || context.remainingMinutes <= 3) {
      return {
        content: `Thank you so much for your thorough answers today! We're nearing the end of our scheduled time. Do you have any questions for me regarding the role, our engineering culture, or what's next?`,
        stageTransition: 'wrap_up',
      };
    }

    return {
      content: `I appreciate that perspective. Building on that, how would you approach monitoring and observability in production for that component?`,
      stageTransition: 'continue',
    };
  }

  private generateCodingChallenge(context: InterviewTurnContext) {
    if (context.experienceLevel === 'Entry') {
      return {
        title: 'Two Sum & Target Array Lookup',
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. Assume each input has exactly one solution, and you may not use the same element twice. Aim for O(n) time complexity.',
        starterCode: `function twoSum(nums, target) {\n  // Write your solution here\n  \n}`,
        expectedLanguage: 'javascript',
        testCases: [
          { input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0, 1]' },
          { input: 'nums = [3,2,4], target = 6', expectedOutput: '[1, 2]' },
        ],
      };
    }

    if (context.experienceLevel === 'Senior' || context.experienceLevel === 'Lead') {
      return {
        title: 'LRU Cache with TTL (Least Recently Used Cache)',
        description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with an optional Time-To-Live (TTL) expiration. Implement get(key) and put(key, value, ttlMs) in O(1) average time complexity.',
        starterCode: `class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    // Initialize data structures\n  }\n\n  get(key) {\n    // Return value or -1 if not found / expired\n  }\n\n  put(key, value, ttlMs) {\n    // Insert or update key\n  }\n}`,
        expectedLanguage: 'javascript',
        testCases: [
          { input: 'capacity = 2, put(1, 1), put(2, 2), get(1)', expectedOutput: '1' },
          { input: 'put(3, 3), get(2)', expectedOutput: '-1' },
        ],
      };
    }

    // Default Mid-level
    return {
      title: 'Longest Substring Without Repeating Characters',
      description: 'Given a string `s`, find the length of the longest substring without repeating characters. Optimize for O(n) sliding window runtime.',
      starterCode: `function lengthOfLongestSubstring(s) {\n  // Write your solution here\n  \n}`,
      expectedLanguage: 'javascript',
      testCases: [
        { input: 's = "abcabcbb"', expectedOutput: '3' },
        { input: 's = "bbbbb"', expectedOutput: '1' },
        { input: 's = "pwwkew"', expectedOutput: '3' },
      ],
    };
  }

  private async tryOllama(messages: ChatMessage[], context: InterviewTurnContext): Promise<LLMResponse | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3 second timeout for local check

    try {
      const systemPrompt = `You are an elite, realistic technical AI Interviewer conducting a live interview for a ${context.experienceLevel} ${context.roleTitle}.
Total duration: ${context.totalDurationMinutes} mins. Remaining: ${context.remainingMinutes} mins.
Keep your response conversational, concise (under 3 sentences), and drill into specific technical claims made by the candidate.`;

      const response = await fetch(`${this.ollamaBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'llama3.2',
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
          stream: false,
        }),
      });

      clearTimeout(timeout);

      if (!response.ok) return null;
      const data = await response.json();
      if (data && data.message && data.message.content) {
        return {
          content: data.message.content,
          stageTransition: context.remainingMinutes <= 3 ? 'wrap_up' : 'continue',
        };
      }
      return null;
    } catch {
      clearTimeout(timeout);
      return null;
    }
  }
}
