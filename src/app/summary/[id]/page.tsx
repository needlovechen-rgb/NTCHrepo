import React from 'react';
import { TechnicalSummaryService } from '@/services/TechnicalSummaryService';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  FileText,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Edit,
  Sparkles,
  Layers,
} from 'lucide-react';

interface SummaryPageProps {
  params: {
    id: string;
  };
}

export default async function SummaryPage({ params }: SummaryPageProps) {
  let summary = null;
  try {
    summary = await TechnicalSummaryService.generateSummary(params.id);
  } catch {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 頂部功能列 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
              PAGE 03
            </span>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-400" />
              技術需求總表 (Technical Requirement Summary)
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            由 Technical Summary Engine 自動解析整合，提供舞台與技術人員快速掌握技術規格。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/form/${params.id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition"
          >
            <Edit className="w-3.5 h-3.5" />
            返回填寫 (PAGE 01)
          </Link>

          <a
            href={`/print/${params.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            匯出 PDF (A4)
          </a>

          <a
            href={`/api/events/${params.id}/export/excel`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            匯出 Excel
          </a>
        </div>
      </div>

      {/* 演出基本資訊看板 (Event Header) */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-sky-950 text-sky-400 border border-sky-800">
              ID: {summary.event.id}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
              {summary.event.status.toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            更新時間: {new Date(summary.event.updatedAt).toLocaleString('zh-TW')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-sky-400 mt-1 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">演出名稱與日期</p>
              <p className="text-sm font-semibold text-slate-100">{summary.event.name}</p>
              <p className="text-xs text-sky-300 font-mono">{summary.event.date}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">演出地點</p>
              <p className="text-sm font-semibold text-slate-100">{summary.event.venue}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-amber-400 mt-1 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">填表人 / 聯絡電話</p>
              <p className="text-sm font-semibold text-slate-100">
                {summary.event.formUser || '未填寫'}
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {summary.event.contactPhone || '無電話'}
              </p>
            </div>
          </div>
        </div>

        {summary.event.notes && (
          <div className="pt-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-400 mr-2">演出備註:</span>
            {summary.event.notes}
          </div>
        )}
      </div>

      {/* 🔴 重要需求高亮標記區塊 (Technical Highlight System) */}
      {summary.highlights.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-500/30 shadow-lg shadow-rose-950/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            <h2 className="text-base font-bold text-rose-200">
              重要技術需求摘要 (TECHNICAL HIGHLIGHTS)
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.highlights.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 各技術分類規格明細 (Category Summary Cards) */}
      <div className="space-y-4">
        {summary.categories.map((cat) => (
          <div
            key={cat.id}
            className="glass-panel p-6 rounded-2xl space-y-4 hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-400" />
                {cat.name}
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {cat.items.length} 項需求
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cat.items.map((item) => (
                <div
                  key={item.questionId}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition ${
                    item.isHighlighted
                      ? 'bg-rose-950/20 border-rose-500/40 shadow-sm shadow-rose-500/10'
                      : 'bg-slate-900/50 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-slate-400">
                      {item.question}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      v{item.questionVersion}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <span
                      className={`text-sm font-semibold ${
                        item.isHighlighted
                          ? 'text-rose-200 font-bold'
                          : 'text-slate-200'
                      }`}
                    >
                      {Array.isArray(item.answer)
                        ? item.answer.join(', ')
                        : String(item.answer)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
