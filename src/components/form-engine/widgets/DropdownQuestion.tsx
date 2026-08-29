import React from 'react';
import { QuestionWidgetProps } from './types';

export const DropdownQuestion: React.FC<QuestionWidgetProps> = ({
  question,
  value,
  onChange,
  disabled,
  required,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVal = e.target.value;
    const matchedOpt = question.options.find((o) => o.value === selectedVal);
    onChange(
      selectedVal,
      matchedOpt ? matchedOpt.id : undefined,
      matchedOpt ? matchedOpt.versionId : undefined
    );
  };

  return (
    <div className="w-full">
      <select
        value={value ?? ''}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        className="w-full px-4 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="" disabled>
          -- 請選擇項目 --
        </option>
        {question.options.map((opt) => (
          <option key={opt.id} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
