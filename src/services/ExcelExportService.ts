import * as XLSX from 'xlsx';
import { TechnicalSummaryService } from './TechnicalSummaryService';

export class ExcelExportService {
  /**
   * 產出 Excel Workbook Buffer (僅包含「技術需求總表」工作表)
   */
  static async generateExcelBuffer(eventId: string): Promise<Buffer> {
    const summary = await TechnicalSummaryService.generateSummary(eventId);

    const wb = XLSX.utils.book_new();

    // ==========================================
    // 技術需求總表
    // ==========================================
    const sheetData: any[] = [];
    sheetData.push(['演出技術會議需求總表']);
    sheetData.push([
      `演出名稱: ${summary.event.name}`,
      `演出日期: ${summary.event.date}`,
      `演出地點: ${summary.event.venue}`,
    ]);
    sheetData.push([
      `填表人: ${summary.event.formUser || '未填寫'}`,
      `聯絡電話: ${summary.event.contactPhone || '未填寫'}`,
      `狀態: ${summary.event.status}`,
    ]);

    if (summary.highlights.length > 0) {
      sheetData.push([`🔴 重要需求: ${summary.highlights.join(' / ')}`]);
    }
    sheetData.push([]); // 空行
    sheetData.push(['分類', '題目', '回答', '備註 / 高亮標記']);

    for (const cat of summary.categories) {
      for (const item of cat.items) {
        sheetData.push([
          cat.name,
          item.question,
          Array.isArray(item.answer) ? item.answer.join(', ') : item.answer,
          item.isHighlighted ? '★ 重要需求' : '',
        ]);
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [{ wch: 18 }, { wch: 28 }, { wch: 35 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws, '技術需求總表');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}
