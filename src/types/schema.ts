export type UserRole = 'USER' | 'TECH_MANAGER' | 'ADMIN';

export type QuestionType =
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'time'
  | 'multiselect';

export type RuleOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'in'
  | 'not_in';

export type RuleAction =
  | 'show'
  | 'hide'
  | 'enable'
  | 'disable'
  | 'required'
  | 'optional';

export interface OptionItem {
  id: string; // opt_uuid
  questionId: string;
  versionId: string; // ov_uuid
  version: number;
  label: string; // 代錄影 HD
  value: string; // record_hd
  sortOrder: number;
  enabled: boolean;
  isActive: boolean;
}

export interface QuestionItem {
  id: string; // q_uuid
  categoryId: string;
  key: string;
  type: QuestionType;
  required: boolean;
  enabled: boolean;
  sortOrder: number;
  versionId: string; // qv_uuid
  version: number;
  title: string;
  description?: string;
  options: OptionItem[];
}

export interface CategoryItem {
  id: string; // cat_uuid
  key: string;
  name: string;
  sortOrder: number;
  enabled: boolean;
  questions: QuestionItem[];
}

export interface ConditionalRuleItem {
  id: string; // rule_uuid
  sourceQuestionId: string;
  operator: RuleOperator;
  sourceValue: string | string[] | number | boolean;
  action: RuleAction;
  targetQuestionIds: string[];
  logicGroup?: {
    conjunction: 'AND' | 'OR';
    conditions: Array<{
      sourceQuestionId: string;
      operator: RuleOperator;
      sourceValue: any;
    }>;
  };
  enabled: boolean;
}

export interface EventData {
  id: string;
  name: string;
  eventDate: string; // YYYY-MM-DD
  venueId?: string;
  venueName?: string;
  formUser?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  status: 'draft' | 'submitted' | 'archived' | 'approved' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface AnswerItem {
  id?: string;
  eventId: string;
  questionId: string;
  questionVersionId: string;
  optionId?: string;
  optionVersionId?: string;
  value: any;
  valueType: 'option' | 'multi_option' | 'text' | 'number' | 'date';
}

export interface FormSchema {
  categories: CategoryItem[];
  rules: ConditionalRuleItem[];
  event?: EventData;
  answers?: Record<string, AnswerItem>; // keyed by questionId
}
