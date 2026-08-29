import React from 'react';
import { TechnicalSummaryService } from '@/services/TechnicalSummaryService';
import { notFound } from 'next/navigation';
import PrintButton from './PrintButton';

interface PrintPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PrintPageProps) {
  try {
    const summary = await TechnicalSummaryService.generateSummary(params.id);
    const fileName = `${summary.event.name}_${summary.event.date}`.replace(/[\\/:*?"<>|]/g, '_');
    return {
      title: fileName,
    };
  } catch {
    return { title: '技術需求總表' };
  }
}

export default async function PrintPage({ params }: PrintPageProps) {
  let summary = null;
  try {
    summary = await TechnicalSummaryService.generateSummary(params.id);
  } catch {
    return notFound();
  }

  const fileName = `${summary.event.name}_${summary.event.date}`.replace(/[\\/:*?"<>|]/g, '_');

  return (
    <>
      {/* 開啟頁面後自動設定檔名並觸發列印 */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('load', function() {
              document.title = ${JSON.stringify(fileName)};
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(${JSON.stringify(fileName)}).catch(function(){});
              }
              setTimeout(function() { window.print(); }, 500);
            });
          `,
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Noto Sans TC', 'Microsoft JhengHei', 'PingFang TC', 'Arial Unicode MS', sans-serif;
          font-size: 11pt;
          color: #1a1a1a;
          background: #fff;
        }
        .print-page {
          width: 210mm;
          min-height: 297mm;
          padding: 15mm 18mm;
          margin: 0 auto;
          background: #fff;
        }
        h1 { font-size: 16pt; font-weight: 700; text-align: center; margin-bottom: 4pt; }
        h2 { font-size: 13pt; font-weight: 700; margin: 12pt 0 6pt; border-bottom: 1.5pt solid #333; padding-bottom: 3pt; }
        .subtitle { text-align: center; font-size: 10pt; color: #555; margin-bottom: 14pt; }
        .meta-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 4pt 20pt;
          margin-bottom: 12pt; padding: 8pt 10pt;
          border: 1pt solid #ccc; border-radius: 4pt; background: #fafafa;
        }
        .meta-item { font-size: 10pt; }
        .meta-label { color: #555; margin-right: 4pt; }
        .meta-value { font-weight: 600; }
        .highlights {
          padding: 8pt 10pt; background: #fff3f3;
          border: 1.5pt solid #e03030; border-radius: 4pt; margin-bottom: 12pt;
        }
        .highlights-title { font-size: 10pt; font-weight: 700; color: #c00; margin-bottom: 4pt; }
        .highlights-tags { display: flex; flex-wrap: wrap; gap: 5pt; }
        .tag {
          font-size: 9.5pt; padding: 2pt 6pt;
          border: 1pt solid #e03030; border-radius: 3pt; color: #c00; background: #fff0f0;
        }
        table { width: 100%; border-collapse: collapse; margin-top: 4pt; font-size: 10pt; }
        thead tr { background: #1e293b; color: #fff; }
        thead th { padding: 6pt 8pt; text-align: left; font-weight: 600; font-size: 9.5pt; }
        tbody tr:nth-child(even) { background: #f7f8fa; }
        td { padding: 5pt 8pt; vertical-align: top; border-bottom: 0.5pt solid #dde; }
        td:first-child { width: 22%; font-weight: 500; color: #333; }
        td:nth-child(2) { width: 38%; color: #222; }
        td:nth-child(3) { width: 35%; color: #111; font-weight: 600; }
        td:last-child { width: 5%; text-align: center; }
        .highlight-row td { background: #fff5f5 !important; color: #aa0000; }
        .star { color: #cc0000; font-size: 12pt; }
        .cat-header td {
          background: #334155 !important; color: #fff !important;
          font-weight: 700; font-size: 10pt; padding: 5pt 8pt;
        }
        .footer {
          margin-top: 14pt; padding-top: 8pt; border-top: 1pt solid #ccc;
          display: flex; justify-content: space-between; font-size: 9pt; color: #888;
        }
        @media print {
          @page { size: A4 portrait; margin: 10mm 12mm; }
          body { padding: 0; }
          .print-page { width: 100%; padding: 0; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="print-page">
        <h1>演出技術會議需求總表</h1>
        <p className="subtitle">EVENT TECHNICAL REQUIREMENT SUMMARY</p>

        <div className="meta-grid">
          <div className="meta-item">
            <span className="meta-label">演出名稱</span>
            <span className="meta-value">{summary.event.name}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">演出日期</span>
            <span className="meta-value">{summary.event.date}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">演出地點</span>
            <span className="meta-value">{summary.event.venue}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">填表人</span>
            <span className="meta-value">{summary.event.formUser || '—'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">聯絡電話</span>
            <span className="meta-value">{summary.event.contactPhone || '—'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">狀態</span>
            <span className="meta-value">{summary.event.status.toUpperCase()}</span>
          </div>
        </div>

        {summary.highlights.length > 0 && (
          <div className="highlights">
            <div className="highlights-title">★ 重要技術需求摘要 (TECHNICAL HIGHLIGHTS)</div>
            <div className="highlights-tags">
              {summary.highlights.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        <table>
          <thead>
            <tr>
              <th>分類</th>
              <th>需求項目</th>
              <th>規格 / 選項</th>
              <th>標記</th>
            </tr>
          </thead>
          <tbody>
            {summary.categories.map((cat) => (
              <React.Fragment key={cat.id}>
                <tr>
                  <td className="cat-header" colSpan={4}>{cat.name}</td>
                </tr>
                {cat.items.map((item) => (
                  <tr key={item.questionId} className={item.isHighlighted ? 'highlight-row' : ''}>
                    <td>{cat.name}</td>
                    <td>{item.question}</td>
                    <td>{Array.isArray(item.answer) ? item.answer.join(', ') : String(item.answer)}</td>
                    <td>{item.isHighlighted ? <span className="star">★</span> : ''}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <div className="footer">
          <span>產生時間：{new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}</span>
          <span>Event ID: {summary.event.id}</span>
        </div>
      </div>

      {/* 列印按鈕（Client Component，列印時自動隱藏） */}
      <PrintButton fileName={fileName} />
    </>
  );
}
