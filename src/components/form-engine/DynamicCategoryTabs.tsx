import React from 'react';
import { CategoryItem } from '@/types/schema';
import { Layers } from 'lucide-react';

interface DynamicCategoryTabsProps {
  categories: CategoryItem[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  categoryAnswerCounts?: Record<string, { total: number; filled: number }>;
}

export const DynamicCategoryTabs: React.FC<DynamicCategoryTabsProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  categoryAnswerCounts,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
      {categories.map((cat) => {
        const isActive = cat.id === activeCategoryId;
        const counts = categoryAnswerCounts?.[cat.id];

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              isActive
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10'
                : 'bg-slate-900/70 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Layers className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
            <span>{cat.name}</span>
            {counts && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-sky-500/30 text-sky-200'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {counts.filled}/{counts.total}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
