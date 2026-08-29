import React from 'react';
import { QuestionWidgetProps } from './types';

export const CheckboxQuestion: React.FC<QuestionWidgetProps> = ({
  question,
  value,
  onChange,
  disabled,
}) => {
  const currentArray: string[] = Array.isArray(value) ? value : [];

  const handleToggle = (optVal: string) => {
    let nextArr: string[];
    if (currentArray.includes(optVal)) {
      nextArr = currentArray.filter((v) => v !== optVal);
    } else {
      nextArr = [...currentArray, optVal];
    }
    onChange(nextArr);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {question.options.map((opt) => {
        const isChecked = currentArray.includes(opt.value);
        return (
          <label
            key={opt.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer transition ${
              isChecked
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="checkbox"
              name={question.id}
              value={opt.value}
              checked={isChecked}
              disabled={disabled}
              onChange={() => handleToggle(opt.value)}
              className="hidden"
            />
            <span
              className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                isChecked ? 'border-emerald-400 bg-emerald-400 text-slate-950 font-bold' : 'border-slate-500'
              }`}
            >
              {isChecked && '✓'}
            </span>
            {opt.label}
          </label>
        );
      })}
    </div>
  );
};
