import { NextRequest, NextResponse } from 'next/server';
import { generateReport } from '@/lib/agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.agentId || typeof body.agentId !== 'string') {
      return NextResponse.json({ error: 'Invalid request: "agentId" is required' }, { status: 400 });
    }

    const report = generateReport(body.agentId);

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}