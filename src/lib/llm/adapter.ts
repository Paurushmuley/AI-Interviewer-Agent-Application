import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { LLMProvider, ChatMessage, InterviewTurnContext, LLMResponse } from './types';
import { AntigravityInterviewSubAgent } from './antigravity-agent';
import { OllamaAdapter } from './ollama-adapter';

const antigravityAgent = new AntigravityInterviewSubAgent();
const ollamaAdapter = new OllamaAdapter();

/**
 * Unified Multi-LLM Adapter supporting:
 *  - Antigravity AI Sub-Agent (Built-in autonomous backend agent)
 *  - Ollama Local LLM (localhost:11434)
 *  - External BYOK Providers (OpenAI, Gemini, Groq, xAI Grok, Anthropic)
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
    // 1. Antigravity AI Sub-Agent (Built-in)
    if (provider === 'antigravity' || provider === 'local') {
      return antigravityAgent.generateInterviewTurn(messages, context);
    }

    // 2. Ollama Local Model
    if (provider === 'ollama') {
      return ollamaAdapter.generateInterviewTurn(messages, context, modelName || 'llama3.2');
    }

    // If external provider selected but no key supplied, assign Antigravity Sub-Agent as fallback
    if (!apiKey) {
      return antigravityAgent.generateInterviewTurn(messages, context);
    }

    const systemPrompt = `You are an elite, realistic Technical Interviewer evaluating a candidate for "${context.roleTitle}" (${context.experienceLevel} level).
Interview Duration: ${context.totalDurationMinutes} mins. Remaining: ${context.remainingMinutes} mins.
Current Phase: ${context.interviewStage}.

Candidate Background:
- Matched Skills: ${context.matchedSkills.join(', ') || 'N/A'}
- Areas to probe: ${context.missingSkills.join(', ') || 'System design & coding'}
- Recent NLP Speaking Confidence: ${context.lastCandidateMetrics?.confidenceScore ?? 75}/100

Guidelines:
1. Speak conversationally as a human interviewer on a live video call.
2. Keep questions concise (2-4 sentences max). Never output long lecture paragraphs.
3. If candidate answers vaguely, drill down into implementation details, tradeoffs, and failure modes.
4. If in "coding_challenge" stage, propose a clear coding problem.
5. If remaining time is <= 3 minutes, begin the wrap-up phase.`;

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
        const groq = createOpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });
        const result = await generateText({
          model: groq(modelName || 'llama-3.3-70b-versatile'),
          system: systemPrompt,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7,
        });
        responseText = result.text;
      } else if (provider === 'grok') {
        const grok = createOpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' });
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
      console.error(`[UnifiedLLMAdapter] Error with provider ${provider}, assigning Antigravity Sub-Agent fallback:`, err);
      return antigravityAgent.generateInterviewTurn(messages, context);
    }
  }

  /**
   * Validates if provider is reachable or key is valid.
   */
  static async verifyKey(
    provider: LLMProvider,
    apiKey?: string
  ): Promise<{ valid: boolean; message: string; models?: string[] }> {
    // Antigravity AI Sub-Agent
    if (provider === 'antigravity' || provider === 'local') {
      return {
        valid: true,
        message: 'Antigravity AI Sub-Agent is assigned and ready as Lead Interviewer.',
      };
    }

    // Local Ollama
    if (provider === 'ollama') {
      const pingRes = await ollamaAdapter.ping();
      return {
        valid: pingRes.online,
        message: pingRes.message,
        models: pingRes.models,
      };
    }

    if (!apiKey) {
      return { valid: false, message: 'API key cannot be empty.' };
    }

    try {
      if (provider === 'openai') {
        const openai = createOpenAI({ apiKey });
        await generateText({ model: openai('gpt-4o-mini'), prompt: 'ping', maxTokens: 5 });
      } else if (provider === 'gemini') {
        const google = createGoogleGenerativeAI({ apiKey });
        await generateText({ model: google('gemini-1.5-flash'), prompt: 'ping', maxTokens: 5 });
      } else if (provider === 'groq') {
        const groq = createOpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });
        await generateText({ model: groq('llama-3.3-70b-versatile'), prompt: 'ping', maxTokens: 5 });
      } else if (provider === 'grok') {
        const grok = createOpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' });
        await generateText({ model: grok('grok-2-latest'), prompt: 'ping', maxTokens: 5 });
      } else if (provider === 'anthropic') {
        const anthropic = createAnthropic({ apiKey });
        await generateText({ model: anthropic('claude-3-5-haiku-20241022'), prompt: 'ping', maxTokens: 5 });
      }

      return { valid: true, message: `${provider.toUpperCase()} API key verified successfully!` };
    } catch (error: any) {
      return { valid: false, message: error.message || `Failed to verify key for ${provider}.` };
    }
  }

  /**
   * Evaluates code submission via chosen provider or Antigravity Sub-Agent.
   */
  static async evaluateCode(
    provider: LLMProvider,
    apiKey: string | undefined,
    problemTitle: string,
    problemStatement: string,
    code: string,
    language: string
  ) {
    if (provider === 'antigravity' || provider === 'local' || provider === 'ollama' || !apiKey) {
      return antigravityAgent.evaluateCodeSubmission(problemTitle, problemStatement, code, language);
    }

    try {
      const prompt = `Evaluate candidate's code submission for problem "${problemTitle}".
Description: ${problemStatement}
Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Return JSON in this format:
{
  "score": <0-100>,
  "feedback": "<concise actionable review>",
  "testResults": [{ "passed": boolean, "note": "<test description>" }]
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
        return antigravityAgent.evaluateCodeSubmission(problemTitle, problemStatement, code, language);
      }

      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch {
      return antigravityAgent.evaluateCodeSubmission(problemTitle, problemStatement, code, language);
    }
  }
}
