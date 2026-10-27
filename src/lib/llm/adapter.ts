import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { LLMProvider, ChatMessage, InterviewTurnContext, LLMResponse } from './types';
import { LocalInterviewSubAgent } from './local-subagent';

const localAgent = new LocalInterviewSubAgent();

/**
 * Unified Multi-LLM Adapter with Bring-Your-Own-Key (BYOK) support.
 */
export class UnifiedLLMAdapter {
  /**
   * Generates next interview turn from the selected provider.
   */
  static async generateTurn(
    provider: LLMProvider,
    apiKey: string | undefined,
    messages: ChatMessage[],
    context: InterviewTurnContext,
    modelName?: string
  ): Promise<LLMResponse> {
    // If provider is local or no key is provided, delegate to the backend Local Sub-Agent
    if (provider === 'local' || !apiKey) {
      return localAgent.generateInterviewTurn(messages, context);
    }

    const systemPrompt = `You are a world-class, realistic Technical Interviewer evaluating a candidate for the position of "${context.roleTitle}" (${context.experienceLevel} level).
Interview Duration: ${context.totalDurationMinutes} minutes. Remaining time: ${context.remainingMinutes} minutes.
Current Interview Phase: ${context.interviewStage}.

Candidate Background:
- Matched Skills: ${context.matchedSkills.join(', ') || 'N/A'}
- Areas to probe: ${context.missingSkills.join(', ') || 'General architecture & problem solving'}
- Recent NLP Speaking Confidence: ${context.lastCandidateMetrics?.confidenceScore ?? 75}/100

Guidelines:
1. Speak conversationally as a human interviewer on a live video call.
2. Keep questions concise (2-4 sentences max). Never output long lecture paragraphs.
3. If candidate answers vaguely, drill down into implementation details, tradeoffs, and failure modes.
4. If in "coding_challenge" stage and no coding problem was issued yet, propose a clear coding problem.
5. If remaining time is <= 3 minutes, begin the wrap-up phase and ask if candidate has any questions.`;

    try {
      let responseText = '';

      if (provider === 'openai') {
        const openai = createOpenAI({ apiKey });
        const result = await generateText({
          model: openai(modelName || 'gpt-4o-mini'),
          system: systemPrompt,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7,
        });
        responseText = result.text;
      } else if (provider === 'gemini') {
        const google = createGoogleGenerativeAI({ apiKey });
        const result = await generateText({
          model: google(modelName || 'gemini-1.5-flash'),
          system: systemPrompt,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7,
        });
        responseText = result.text;
      } else if (provider === 'groq') {
        // Groq uses OpenAI-compatible standard
        const groq = createOpenAI({
          apiKey,
          baseURL: 'https://api.groq.com/openai/v1',
        });
        const result = await generateText({
          model: groq(modelName || 'llama-3.3-70b-versatile'),
          system: systemPrompt,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7,
        });
        responseText = result.text;
      } else if (provider === 'grok') {
        // xAI Grok uses OpenAI-compatible standard
        const grok = createOpenAI({
          apiKey,
          baseURL: 'https://api.x.ai/v1',
        });
        const result = await generateText({
          model: grok(modelName || 'grok-2-latest'),
          system: systemPrompt,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7,
        });
        responseText = result.text;
      } else if (provider === 'anthropic') {
        const anthropic = createAnthropic({ apiKey });
        const result = await generateText({
          model: anthropic(modelName || 'claude-3-5-sonnet-20241022'),
          system: systemPrompt,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7,
        });
        responseText = result.text;
      }

      return {
        content: responseText,
        stageTransition: context.remainingMinutes <= 3 ? 'wrap_up' : 'continue',
      };
    } catch (err) {
      console.error(`[UnifiedLLMAdapter] Error with provider ${provider}, falling back to Local Sub-Agent:`, err);
      return localAgent.generateInterviewTurn(messages, context);
    }
  }

  /**
   * Validates if a user-supplied API key is working.
   */
  static async verifyKey(provider: LLMProvider, apiKey: string): Promise<{ valid: boolean; message: string }> {
    if (!apiKey) return { valid: false, message: 'API key is empty.' };
    if (provider === 'local') return { valid: true, message: 'Local agent is always active.' };

    try {
      if (provider === 'openai') {
        const openai = createOpenAI({ apiKey });
        await generateText({
          model: openai('gpt-4o-mini'),
          prompt: 'ping',
          maxTokens: 5,
        });
      } else if (provider === 'gemini') {
        const google = createGoogleGenerativeAI({ apiKey });
        await generateText({
          model: google('gemini-1.5-flash'),
          prompt: 'ping',
          maxTokens: 5,
        });
      } else if (provider === 'groq') {
        const groq = createOpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });
        await generateText({
          model: groq('llama-3.3-70b-versatile'),
          prompt: 'ping',
          maxTokens: 5,
        });
      } else if (provider === 'grok') {
        const grok = createOpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' });
        await generateText({
          model: grok('grok-2-latest'),
          prompt: 'ping',
          maxTokens: 5,
        });
      } else if (provider === 'anthropic') {
        const anthropic = createAnthropic({ apiKey });
        await generateText({
          model: anthropic('claude-3-5-haiku-20241022'),
          prompt: 'ping',
          maxTokens: 5,
        });
      }

      return { valid: true, message: `${provider.toUpperCase()} API key verified successfully!` };
    } catch (error: any) {
      return { valid: false, message: error.message || `Failed to verify key for ${provider}.` };
    }
  }

  /**
   * Code evaluation delegation (either provider LLM or local sub-agent)
   */
  static async evaluateCode(
    provider: LLMProvider,
    apiKey: string | undefined,
    problemTitle: string,
    problemStatement: string,
    code: string,
    language: string
  ) {
    if (provider === 'local' || !apiKey) {
      return localAgent.evaluateCodeSubmission(problemTitle, problemStatement, code, language);
    }

    try {
      const prompt = `You are evaluating a candidate's code submission in a live technical interview.
Problem: ${problemTitle}
Problem Description: ${problemStatement}
Language: ${language}
Submitted Code:
\`\`\`${language}
${code}
\`\`\`

Return a JSON object in this exact format:
{
  "score": <number between 0 and 100>,
  "feedback": "<concise actionable critique>",
  "testResults": [
    { "passed": true/false, "note": "<test case or requirement description>" }
  ]
}`;

      let text = '';
      if (provider === 'openai') {
        const openai = createOpenAI({ apiKey });
        const res = await generateText({ model: openai('gpt-4o-mini'), prompt });
        text = res.text;
      } else if (provider === 'gemini') {
        const google = createGoogleGenerativeAI({ apiKey });
        const res = await generateText({ model: google('gemini-1.5-flash'), prompt });
        text = res.text;
      } else {
        return localAgent.evaluateCodeSubmission(problemTitle, problemStatement, code, language);
      }

      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch {
      return localAgent.evaluateCodeSubmission(problemTitle, problemStatement, code, language);
    }
  }
}
