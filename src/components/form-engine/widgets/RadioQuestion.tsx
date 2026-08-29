import React from 'react';
import { QuestionWidgetProps } from './types';

export const RadioQuestion: React.FC<QuestionWidgetProps> = ({
  question,
  value,
  onChange,
  disabled,
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      {question.options.map((opt) => {
        const isChecked = value === opt.value;
        return (
          <label
            key={opt.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer transition ${
              isChecked
                ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name={question.id}
              value={opt.value}
              checked={isChecked}
              disabled={disabled}
              onChange={() => onChange(opt.value, opt.id, opt.versionId)}
              className="hidden"
            />
            <span
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                isChecked ? 'border-sky-400 bg-sky-400' : 'border-slate-500'
              }`}
            >
              {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
            </span>
            {opt.label}
          </label>
        );
      })}
    </div>
  );
};
