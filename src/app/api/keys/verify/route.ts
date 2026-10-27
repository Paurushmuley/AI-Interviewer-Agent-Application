import { NextRequest, NextResponse } from 'next/server';
import { UnifiedLLMAdapter } from '@/lib/llm/adapter';
import { LLMProvider } from '@/lib/llm/types';

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey } = await req.json();

    if (!provider || !apiKey) {
      return NextResponse.json({ valid: false, message: 'Provider and apiKey are required.' }, { status: 400 });
    }

    const result = await UnifiedLLMAdapter.verifyKey(provider as LLMProvider, apiKey);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ valid: false, message: error.message }, { status: 500 });
  }
}
