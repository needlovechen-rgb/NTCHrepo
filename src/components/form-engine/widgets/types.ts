import { OptionItem, QuestionItem } from '@/types/schema';

export interface QuestionWidgetProps {
  question: QuestionItem;
  value: any;
  onChange: (value: any, optionId?: string, optionVersionId?: string) => void;
  disabled?: boolean;
  required?: boolean;
}
