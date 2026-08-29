import React from 'react';
import { QuestionWidgetProps } from './widgets/types';
import { DropdownQuestion } from './widgets/DropdownQuestion';
import { RadioQuestion } from './widgets/RadioQuestion';
import { CheckboxQuestion } from './widgets/CheckboxQuestion';
import { TextQuestion } from './widgets/TextQuestion';
import { TextareaQuestion } from './widgets/TextareaQuestion';
import { NumberQuestion } from './widgets/NumberQuestion';
import { DateQuestion } from './widgets/DateQuestion';

export const QuestionTypeRegistry: Record<string, React.FC<QuestionWidgetProps>> = {
  dropdown: DropdownQuestion,
  radio: RadioQuestion,
  checkbox: CheckboxQuestion,
  text: TextQuestion,
  textarea: TextareaQuestion,
  number: NumberQuestion,
  date: DateQuestion,
};

export function getWidgetForType(type: string): React.FC<QuestionWidgetProps> {
  const widget = QuestionTypeRegistry[type];
  if (!widget) {
    // 預設回退至 TextQuestion
    return TextQuestion;
  }
  return widget;
}
