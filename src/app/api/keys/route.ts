import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth';
import { encryptApiKey } from '@/lib/crypto';
import { UnifiedLLMAdapter } from '@/lib/llm/adapter';
import { LLMProvider } from '@/lib/llm/types';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('auth_token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const payload = verifyUserToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
    }

    const { provider, apiKey } = await req.json();

    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'Provider and apiKey are required.' }, { status: 400 });
    }

    // Verify key first with provider test ping
    const verification = await UnifiedLLMAdapter.verifyKey(provider as LLMProvider, apiKey);
    if (!verification.valid) {
      return NextResponse.json({ error: `Key validation failed: ${verification.message}` }, { status: 400 });
    }

    // Encrypt key with AES-256-GCM
    const { encrypted, iv, tag } = encryptApiKey(apiKey);

    // Save or update in database
    const savedKey = await prisma.userApiKey.upsert({
      where: {
        userId_provider: {
          userId: payload.userId,
          provider,
        },
      },
      update: {
        encryptedKey: encrypted,
        iv,
        tag,
      },
      create: {
        userId: payload.userId,
        provider,
        encryptedKey: encrypted,
        iv,
        tag,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${provider.toUpperCase()} key securely encrypted and stored.`,
      key: {
        id: savedKey.id,
        provider: savedKey.provider,
        updatedAt: savedKey.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('[Keys API Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to save key.' }, { status: 500 });
  }
}
