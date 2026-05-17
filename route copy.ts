import { NextResponse } from 'next/server';
import { getProviderConfig } from '@/lib/providers';

export async function GET() {
  const config = getProviderConfig();

  return NextResponse.json({
    status: 'ok',
    provider: config.provider,
    timestamp: new Date().toISOString(),
  });
}