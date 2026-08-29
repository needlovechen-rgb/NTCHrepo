import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const venues = await prisma.venue.findMany({
      where: { enabled: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, venues });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
