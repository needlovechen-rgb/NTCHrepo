import { NextResponse } from 'next/server';
import { EventService } from '@/services/EventService';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { eventInfo, answers } = body;
    const res = await EventService.saveDraft(params.id, eventInfo || {}, answers || []);
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
