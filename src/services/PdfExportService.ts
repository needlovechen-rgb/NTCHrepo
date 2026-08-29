import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { TechnicalSummaryService } from './TechnicalSummaryService';

export class PdfExportService {
  /**
   * 產出 A4 規格標準 PDF Buffer
   */
  static async generatePdfBuffer(eventId: string): Promise<Buffer> {
    const summary = await TechnicalSummaryService.generateSummary(eventId);

    // 建立 A4 直式 PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // 標題與基本資訊
    doc.setFontSize(18);
    doc.text('Event Technical Requirement Summary', 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Event Name: ${summary.event.name}`, 14, 28);
    doc.text(`Date: ${summary.event.date} | Venue: ${summary.event.venue}`, 14, 34);
    doc.text(`Contact: ${summary.event.formUser} (${summary.event.contactPhone || 'N/A'})`, 14, 40);

    // 重要需求標記 (Highlights)
    let currentY = 48;
    if (summary.highlights.length > 0) {
      doc.setFillColor(254, 242, 242);
      doc.rect(14, currentY, 182, 12, 'F');
      doc.setTextColor(220, 38, 38);
      doc.setFontSize(10);
      doc.text(`IMPORTANT HIGHLIGHTS: ${summary.highlights.join(' | ')}`, 18, currentY + 7);
      currentY += 18;
    } else {
      currentY += 6;
    }

    // 依分類繪製表格
    const tableRows: any[] = [];
    for (const cat of summary.categories) {
      tableRows.push([{ content: `[ Category: ${cat.name} ]`, colSpan: 2, styles: { fillColor: [240, 244, 248], fontStyle: 'bold' } }]);
      for (const item of cat.items) {
        const answerText = Array.isArray(item.answer) ? item.answer.join(', ') : String(item.answer);
        tableRows.push([
          item.question,
          item.isHighlighted ? `* ${answerText} (KEY REQUIREMENT)` : answerText,
        ]);
      }
    }

    (doc as any).autoTable({
      startY: currentY,
      head: [['Requirement Item', 'Specification / Option']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
      didDrawPage: (data: any) => {
        // Footer: 頁碼與產生時間
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Generated at ${new Date().toISOString()} - Page ${data.pageNumber} of ${pageCount}`,
          14,
          285
        );
      },
    });

    const arrayBuffer = doc.output('arraybuffer');
    return Buffer.from(arrayBuffer);
  }
}
