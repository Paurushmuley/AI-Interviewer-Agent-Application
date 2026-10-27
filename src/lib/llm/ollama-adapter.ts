import { ChatMessage, InterviewTurnContext, LLMResponse } from './types';

/**
 * Ollama Local LLM Adapter:
 * Connects directly to local Ollama runtime (e.g. llama3.2, deepseek-r1, mistral) on http://localhost:11434
 */
export class OllamaAdapter {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  }

  /**
   * Health-check to verify if local Ollama daemon is reachable and list installed models.
   */
  async ping(): Promise<{ online: boolean; models: string[]; message: string }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        return { online: false, models: [], message: `Ollama responded with HTTP ${res.status}.` };
      }

      const data = await res.json();
      const modelNames = (data.models || []).map((m: any) => m.name || m.model);

      return {
        online: true,
        models: modelNames,
        message: modelNames.length > 0
          ? `Ollama is active with ${modelNames.length} models: ${modelNames.slice(0, 3).join(', ')}`
          : 'Ollama is active, but no models found. Run `ollama pull llama3.2`',
      };
    } catch {
      clearTimeout(timeout);
      return {
        online: false,
        models: [],
        message: 'Could not connect to Ollama at http://127.0.0.1:11434. Make sure `ollama serve` is running.',
      };
    }
  }

  /**
   * Generates next interview turn using local Ollama model.
   */
  async generateInterviewTurn(
    messages: ChatMessage[],
    context: InterviewTurnContext,
    modelName: string = 'llama3.2'
  ): Promise<LLMResponse> {
    const systemPrompt = `You are Arohi, an elite Lead AI Technical Interviewer conducting a live video interview for a ${context.experienceLevel} ${context.roleTitle}.
Total duration: ${context.totalDurationMinutes} mins. Remaining: ${context.remainingMinutes} mins.
Current phase: ${context.interviewStage}.

Matched candidate skills: ${context.matchedSkills.join(', ') || 'N/A'}.
Areas to probe: ${context.missingSkills.join(', ') || 'System design & coding'}.

Instructions:
1. Speak as a human interviewer on a video call in a warm, articulate Indian English conversational manner.
2. Keep responses concise (2 to 4 sentences).
3. Do NOT use markdown symbols (*, **, #, backticks) or bullet points, as this text will be spoken aloud to the candidate.
4. Ask targeted follow-up questions probing architecture, concurrency, performance, or tradeoffs.
5. If remaining time is <= 3 minutes, ask wrap-up closing questions.`;

    const chatPayload = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ];

    try {
      const res = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          messages: chatPayload,
          stream: false,
        }),
      });

      if (!res.ok) {
        throw new Error(`Ollama returned status ${res.status}`);
      }

      const data = await res.json();
      let reply = data.message?.content?.trim();

      if (!reply) {
        throw new Error('Empty response received from Ollama model.');
      }

      // Strip <think> tags from reasoning models (e.g. DeepSeek-R1)
      reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

      return {
        content: reply,
        stageTransition: context.remainingMinutes <= 3 ? 'wrap_up' : 'continue',
      };
    } catch (err: any) {
      console.warn(`[OllamaAdapter] Request failed (${err.message}). Using fallback message.`);
      return {
        content: `[Ollama Local Warning: Ensure \`ollama serve\` is active and \`${modelName}\` is downloaded.] Welcome to your ${context.roleTitle} interview. I am Arohi. Could you walk me through your engineering background and your core technical strengths?`,
        stageTransition: 'continue',
      };
    }
  }
}
