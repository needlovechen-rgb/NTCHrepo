'use client';

import React, { useState } from 'react';

interface PrintButtonProps {
  fileName?: string;
}

export default function PrintButton({ fileName = '技術需求總表' }: PrintButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fileName).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
    }
  };

  const handlePrint = () => {
    // 1. 設定網頁標題（讓瀏覽器「另存為 PDF」自動抓取檔名）
    document.title = fileName;
    
    // 2. 自動將檔名複製到剪貼簿（若使用 Windows Microsoft Print to PDF 可直接按 Ctrl+V 貼上）
    copyToClipboard();

    // 3. 呼叫瀏覽器列印
    window.print();
  };

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px',
        maxWidth: '380px',
      }}
    >
      {/* 檔名與列印提示小卡 */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#e2e8f0',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '12px',
          lineHeight: '1.6',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>💡 另存 PDF 檔名說明</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>預設檔名：{fileName}</span>
        </div>
        <div style={{ color: '#cbd5e1', fontSize: '11.5px' }}>
          • 印表機請選 <b>「另存為 PDF」</b>（瀏覽器自動代入檔名）<br />
          • 若跳出另存視窗，檔名已為您複製，直接按 <b>Ctrl + V</b> 即可貼上！
        </div>
      </div>

      {/* 按鈕群組 */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={copyToClipboard}
          style={{
            padding: '10px 16px',
            background: copied ? '#10b981' : '#334155',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          {copied ? '✓ 已複製檔名' : '📋 複製檔名'}
        </button>

        <button
          onClick={handlePrint}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
            transition: 'transform 0.1s',
          }}
        >
          🖨 列印 / 另存 PDF
        </button>
      </div>
    </div>
  );
}
