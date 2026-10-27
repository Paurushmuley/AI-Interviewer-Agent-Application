import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth';
import { maskApiKey } from '@/lib/crypto';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('auth_token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = verifyUserToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        apiKeys: {
          select: {
            id: true,
            provider: true,
            updatedAt: true,
            encryptedKey: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 404 });
    }

    const maskedKeys = user.apiKeys.map(k => ({
      id: k.id,
      provider: k.provider,
      updatedAt: k.updatedAt,
      isConfigured: true,
    }));

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        keys: maskedKeys,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
