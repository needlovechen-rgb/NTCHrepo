import { NextResponse } from 'next/server';
import { TechnicalSummaryService } from '@/services/TechnicalSummaryService';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const summary = await TechnicalSummaryService.generateSummary(params.id);
    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
