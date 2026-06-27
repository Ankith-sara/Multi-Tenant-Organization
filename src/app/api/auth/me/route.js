import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    return NextResponse.json({ user: session }, { status: 200 });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'An error occurred checking session.' },
      { status: 500 }
    );
  }
}
