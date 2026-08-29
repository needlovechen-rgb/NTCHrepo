import { NextResponse } from 'next/server';
import { ExcelExportService } from '@/services/ExcelExportService';
import { TechnicalSummaryService } from '@/services/TechnicalSummaryService';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const [buffer, summary] = await Promise.all([
      ExcelExportService.generateExcelBuffer(params.id),
      TechnicalSummaryService.generateSummary(params.id),
    ]);

    // 建立中文安全檔名：{演出名稱}_{演出日期}.xlsx
    const rawName = `${summary.event.name}_${summary.event.date}`;
    const encodedName = encodeURIComponent(rawName) + '.xlsx';

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // RFC 5987 編碼支援中文檔名 (現代瀏覽器全支援)
        'Content-Disposition': `attachment; filename="technical_summary.xlsx"; filename*=UTF-8''${encodedName}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
