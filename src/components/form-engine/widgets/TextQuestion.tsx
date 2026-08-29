import React from 'react';
import { QuestionWidgetProps } from './types';

export const TextQuestion: React.FC<QuestionWidgetProps> = ({
  question,
  value,
  onChange,
  disabled,
  required,
}) => {
  return (
    <div className="w-full">
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.description || '請輸入詳細內容...'}
        disabled={disabled}
        required={required}
        className="w-full px-4 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition disabled:opacity-50"
      />
    </div>
  );
};
