import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '@/lib/agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.input || typeof body.input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: "input" field is required and must be a string' },
        { status: 400 }
      );
    }

    if (body.input.trim().length === 0) {
      return NextResponse.json({ error: 'Input cannot be empty' }, { status: 400 });
    }

    const { result } = await runAgent(body.input, body.formData);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Agent error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}