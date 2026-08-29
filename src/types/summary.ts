export interface SummaryQuestionItem {
  questionId: string;
  questionKey: string;
  question: string;
  questionVersion: number;
  answer: string | string[] | number;
  rawAnswerValue?: any;
  optionId?: string;
  optionLabel?: string;
  isHighlighted?: boolean;
}

export interface SummaryCategoryGroup {
  id: string;
  key: string;
  name: string;
  items: SummaryQuestionItem[];
}

export interface TechnicalSummaryObject {
  event: {
    id: string;
    name: string;
    date: string;
    venue: string;
    formUser: string;
    contactPerson: string;
    contactPhone: string;
    contactEmail: string;
    notes?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  highlights: string[]; // 例如: ['4K投影', '3機錄影', '多軌錄音', '8組DI']
  categories: SummaryCategoryGroup[];
}
