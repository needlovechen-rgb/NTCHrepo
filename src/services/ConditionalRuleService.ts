import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export class ConditionalRuleService {
  /**
   * 取得所有條件規則
   */
  static async listRules() {
    return prisma.conditionalRule.findMany({
      include: { sourceQuestion: { include: { versions: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * 建立條件規則
   */
  static async createRule(data: {
    sourceQuestionId: string;
    operator: string;
    sourceValue: any;
    action: string;
    targetQuestionIds: string[];
    logicGroup?: any;
  }) {
    const id = `rule_${uuidv4().substring(0, 8)}`;
    const rule = await prisma.conditionalRule.create({
      data: {
        id,
        sourceQuestionId: data.sourceQuestionId,
        operator: data.operator,
        sourceValue:
          typeof data.sourceValue === 'object'
            ? JSON.stringify(data.sourceValue)
            : String(data.sourceValue),
        action: data.action,
        targetQuestionIds: JSON.stringify(data.targetQuestionIds),
        logicGroup: data.logicGroup ? JSON.stringify(data.logicGroup) : null,
        enabled: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        id: `audit_${uuidv4().substring(0, 8)}`,
        action: 'CREATE_CONDITIONAL_RULE',
        entityType: 'ConditionalRule',
        entityId: id,
        after: JSON.stringify(rule),
      },
    });

    return rule;
  }

  /**
   * 軟刪除 / 切換規則啟用狀態
   */
  static async toggleRule(ruleId: string, enabled: boolean) {
    return prisma.conditionalRule.update({
      where: { id: ruleId },
      data: { enabled },
    });
  }
}
