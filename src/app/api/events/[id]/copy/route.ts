import { NextResponse } from 'next/server';
import { EventService } from '@/services/EventService';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { name, eventDate } = body;
    const res = await EventService.copyEvent(params.id, name, eventDate);
    return NextResponse.json({ success: true, event: res });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
