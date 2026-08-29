import React from 'react';
import { QuestionItem } from '@/types/schema';
import { getWidgetForType } from './QuestionTypeRegistry';

interface DynamicQuestionProps {
  question: QuestionItem;
  value: any;
  onChange: (value: any, optionId?: string, optionVersionId?: string) => void;
  disabled?: boolean;
  required?: boolean;
  visible?: boolean;
}

export const DynamicQuestion: React.FC<DynamicQuestionProps> = ({
  question,
  value,
  onChange,
  disabled = false,
  required = false,
  visible = true,
}) => {
  if (!visible) return null;

  const Widget = getWidgetForType(question.type);

  return (
    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition duration-200 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <label className="text-base font-semibold text-slate-100 flex items-center gap-2">
            {question.title}
            {required && <span className="text-rose-400 font-bold">*</span>}
          </label>
          {question.description && (
            <p className="text-xs text-slate-400 mt-1">{question.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {question.type}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950/60 text-sky-400 border border-sky-800/50">
            v{question.version}
          </span>
        </div>
      </div>

      <div className="mt-2">
        <Widget
          question={question}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
        />
      </div>
    </div>
  );
};
