import React from 'react';
import { FormSchemaService } from '@/services/FormSchemaService';
import { DynamicFormEngine } from '@/components/form-engine/DynamicFormEngine';
import { notFound } from 'next/navigation';
import { FileEdit, ShieldAlert } from 'lucide-react';

interface FormPageProps {
  params: {
    eventId: string;
  };
}

export default async function FormPage({ params }: FormPageProps) {
  const schema = await FormSchemaService.getActiveFormSchema(params.eventId);

  if (!schema.event) {
    return notFound();
  }

  const isSubmitted = schema.event.status === 'submitted';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 頂部標題 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-sky-950 text-sky-400 border border-sky-800">
              PAGE 01
            </span>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <FileEdit className="w-6 h-6 text-sky-400" />
              技術會議資料填寫
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            由資料庫動態驅動的技術問卷表單，支援即時條件連動與草稿自動存檔。
          </p>
        </div>

        {isSubmitted && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <ShieldAlert className="w-4 h-4" />
            <span>此問卷已於提交時鎖定快照，修改將建立新草稿</span>
          </div>
        )}
      </div>

      {/* 動態表單引擎核心 */}
      <DynamicFormEngine initialSchema={schema} eventId={params.eventId} />
    </div>
  );
}
