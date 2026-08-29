import { NextResponse } from 'next/server';
import { PdfExportService } from '@/services/PdfExportService';
import { TechnicalSummaryService } from '@/services/TechnicalSummaryService';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const [buffer, summary] = await Promise.all([
      PdfExportService.generatePdfBuffer(params.id),
      TechnicalSummaryService.generateSummary(params.id),
    ]);

    const rawName = `${summary.event.name}_${summary.event.date}`.replace(/[\\/:*?"<>|]/g, '_');
    const encodedName = encodeURIComponent(rawName) + '.pdf';

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="technical_summary.pdf"; filename*=UTF-8''${encodedName}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
