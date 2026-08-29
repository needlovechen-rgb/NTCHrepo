import { NextResponse } from 'next/server';
import { EventService } from '@/services/EventService';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const res = await EventService.submitEvent(params.id);
    return NextResponse.json({ success: true, event: res });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
