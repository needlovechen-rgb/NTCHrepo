import { ConditionalRuleItem, RuleOperator } from '@/types/schema';

export interface QuestionState {
  visible: boolean;
  enabled: boolean;
  required: boolean;
}

export function evaluateOperator(
  actualValue: any,
  operator: RuleOperator,
  targetValue: any
): boolean {
  if (actualValue === undefined || actualValue === null) {
    if (operator === 'not_equals') return true;
    if (operator === 'not_in') return true;
    return false;
  }

  // 轉型輔助
  const actualStr = String(actualValue).trim().toLowerCase();
  const targetStr = String(targetValue).trim().toLowerCase();

  switch (operator) {
    case 'equals':
      return actualStr === targetStr;
    case 'not_equals':
      return actualStr !== targetStr;
    case 'contains':
      if (Array.isArray(actualValue)) {
        return actualValue.some((v) => String(v).toLowerCase() === targetStr);
      }
      return actualStr.includes(targetStr);
    case 'not_contains':
      if (Array.isArray(actualValue)) {
        return !actualValue.some((v) => String(v).toLowerCase() === targetStr);
      }
      return !actualStr.includes(targetStr);
    case 'greater_than':
      return Number(actualValue) > Number(targetValue);
    case 'less_than':
      return Number(actualValue) < Number(targetValue);
    case 'in':
      if (Array.isArray(targetValue)) {
        return targetValue.map((v) => String(v).toLowerCase()).includes(actualStr);
      }
      return targetStr.split(',').map((s) => s.trim()).includes(actualStr);
    case 'not_in':
      if (Array.isArray(targetValue)) {
        return !targetValue.map((v) => String(v).toLowerCase()).includes(actualStr);
      }
      return !targetStr.split(',').map((s) => s.trim()).includes(actualStr);
    default:
      return false;
  }
}

export function evaluateRules(
  rules: ConditionalRuleItem[],
  answers: Record<string, any>, // questionId -> value
  defaultStates: Record<string, { required: boolean }>
): Record<string, QuestionState> {
  const states: Record<string, QuestionState> = {};

  // 1. 初始化預設狀態
  for (const qId of Object.keys(defaultStates)) {
    states[qId] = {
      visible: true,
      enabled: true,
      required: defaultStates[qId].required || false,
    };
  }

  // 2. 依序計算規則
  for (const rule of rules) {
    if (!rule.enabled) continue;

    const sourceVal = answers[rule.sourceQuestionId];
    let matched = false;

    if (rule.logicGroup && rule.logicGroup.conditions?.length > 0) {
      if (rule.logicGroup.conjunction === 'AND') {
        matched = rule.logicGroup.conditions.every((c) =>
          evaluateOperator(answers[c.sourceQuestionId], c.operator as RuleOperator, c.sourceValue)
        );
      } else {
        matched = rule.logicGroup.conditions.some((c) =>
          evaluateOperator(answers[c.sourceQuestionId], c.operator as RuleOperator, c.sourceValue)
        );
      }
    } else {
      matched = evaluateOperator(sourceVal, rule.operator, rule.sourceValue);
    }

    if (matched) {
      for (const targetId of rule.targetQuestionIds) {
        if (!states[targetId]) {
          states[targetId] = { visible: true, enabled: true, required: false };
        }

        switch (rule.action) {
          case 'hide':
            states[targetId].visible = false;
            break;
          case 'show':
            states[targetId].visible = true;
            break;
          case 'disable':
            states[targetId].enabled = false;
            break;
          case 'enable':
            states[targetId].enabled = true;
            break;
          case 'required':
            states[targetId].required = true;
            break;
          case 'optional':
            states[targetId].required = false;
            break;
        }
      }
    }
  }

  return states;
}
