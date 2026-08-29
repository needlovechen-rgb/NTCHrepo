import { prisma } from '@/lib/db';
import { evaluateRules } from '@/lib/ruleEngine';
import { ConditionalRuleItem } from '@/types/schema';
import {
  SummaryCategoryGroup,
  SummaryQuestionItem,
  TechnicalSummaryObject,
} from '@/types/summary';

export class TechnicalSummaryService {
  /**
   * 核心總表產出引擎 (Summary Engine)
   */
  static async generateSummary(eventId: string): Promise<TechnicalSummaryObject> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        venue: true,
        answers: {
          include: {
            question: {
              include: {
                category: true,
                versions: true,
              },
            },
            questionVersion: true,
            optionVersion: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    // 1. 取得條件規則以計算可見性
    const dbRules = await prisma.conditionalRule.findMany({
      where: { enabled: true },
    });

    const rules: ConditionalRuleItem[] = dbRules.map((r) => {
      let targetIds: string[] = [];
      try {
        targetIds = JSON.parse(r.targetQuestionIds);
      } catch {
        targetIds = [r.targetQuestionIds];
      }

      let parsedSourceVal: any = r.sourceValue;
      try {
        parsedSourceVal = JSON.parse(r.sourceValue);
      } catch {
        parsedSourceVal = r.sourceValue;
      }

      return {
        id: r.id,
        sourceQuestionId: r.sourceQuestionId,
        operator: r.operator as any,
        sourceValue: parsedSourceVal,
        action: r.action as any,
        targetQuestionIds: targetIds,
        enabled: r.enabled,
      };
    });

    // 彙整 answers key-value
    const answersMap: Record<string, any> = {};
    const defaultStates: Record<string, { required: boolean }> = {};

    for (const ans of event.answers) {
      let val: any = ans.value;
      try {
        val = JSON.parse(ans.value);
      } catch {
        val = ans.value;
      }
      answersMap[ans.questionId] = val;
      defaultStates[ans.questionId] = { required: ans.questionVersion?.required || false };
    }

    // 透過條件邏輯引擎評估被隱藏的項目
    const visibilityStates = evaluateRules(rules, answersMap, defaultStates);

    // 2. 依照 Category 進行分組整理
    const categories = await prisma.category.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: 'asc' },
    });

    const categoryMap = new Map<string, SummaryCategoryGroup>();
    for (const cat of categories) {
      categoryMap.set(cat.id, {
        id: cat.id,
        key: cat.key,
        name: cat.name,
        items: [],
      });
    }

    const highlights: string[] = [];

    for (const ans of event.answers) {
      const q = ans.question;
      if (!q) continue;

      // 若在條件邏輯中被隱藏，則不納入總表
      if (visibilityStates[q.id] && visibilityStates[q.id].visible === false) {
        continue;
      }

      const qVer = ans.questionVersion;
      const optVer = ans.optionVersion;

      let displayAnswer = '';
      let rawVal = ans.value;
      try {
        rawVal = JSON.parse(ans.value);
      } catch {
        rawVal = ans.value;
      }

      if (optVer && optVer.label) {
        displayAnswer = optVer.label;
      } else if (Array.isArray(rawVal)) {
        displayAnswer = rawVal.join(', ');
      } else {
        displayAnswer = String(rawVal || '');
      }

      // 若未填寫或不需要，仍可列出或顯示清楚狀態
      if (!displayAnswer && ans.valueType === 'option') {
        displayAnswer = '未指定';
      }

      // 3. Highlight 規則判定 (資料化條件)
      let isHigh = false;
      const qKey = q.key;
      const ansStr = String(displayAnswer).toLowerCase();

      if (qKey === 'video_format' && ansStr.includes('4k')) {
        isHigh = true;
        highlights.push('4K 影像格式');
      } else if (qKey === 'projection_resolution' && ansStr.includes('4k')) {
        isHigh = true;
        highlights.push('4K 投影解析度');
      } else if (qKey === 'video_camera_count' && (ansStr.includes('3') || ansStr.includes('4') || ansStr.includes('多'))) {
        isHigh = true;
        highlights.push('3機以上錄影配置');
      } else if (qKey === 'recording' && ansStr.includes('多軌')) {
        isHigh = true;
        highlights.push('多軌錄音需求');
      } else if (
        (qKey === 'intercom_wired_count' || qKey === 'intercom_wireless_count') &&
        (ansStr.includes('8') || ansStr.includes('10'))
      ) {
        isHigh = true;
        highlights.push('8台以上 INTERCOM 系統');
      } else if (qKey === 'power' && ansStr.includes('大電')) {
        isHigh = true;
        highlights.push(`大電電力需求 (${displayAnswer})`);
      } else if (qKey === 'special_equipment' && displayAnswer.trim().length > 0) {
        isHigh = true;
        highlights.push('特殊器材需求');
      }

      const item: SummaryQuestionItem = {
        questionId: q.id,
        questionKey: q.key,
        question: qVer ? qVer.title : q.key,
        questionVersion: qVer ? qVer.version : 1,
        answer: displayAnswer,
        rawAnswerValue: rawVal,
        optionId: ans.optionId || undefined,
        optionLabel: optVer?.label,
        isHighlighted: isHigh,
      };

      const group = categoryMap.get(q.categoryId);
      if (group) {
        group.items.push(item);
      } else {
        // 分類不存在時動態建立群組
        const dynamicCatName = q.category?.name || '其他需求';
        if (!categoryMap.has(q.categoryId)) {
          categoryMap.set(q.categoryId, {
            id: q.categoryId,
            key: q.category?.key || 'unknown',
            name: dynamicCatName,
            items: [item],
          });
        } else {
          categoryMap.get(q.categoryId)!.items.push(item);
        }
      }
    }

    // 過濾掉沒有任何項目的分類（保留有資料的分類）
    const finalCategories = Array.from(categoryMap.values()).filter(
      (c) => c.items.length > 0
    );

    // 去除重複 highlights
    const uniqueHighlights = Array.from(new Set(highlights));

    return {
      event: {
        id: event.id,
        name: event.name,
        date: event.eventDate.toISOString().split('T')[0],
        venue: event.venue?.name || '未指定場地',
        formUser: event.formUser || '',
        contactPerson: event.contactPerson || '',
        contactPhone: event.contactPhone || '',
        contactEmail: event.contactEmail || '',
        notes: event.notes || '',
        status: event.status,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      },
      highlights: uniqueHighlights,
      categories: finalCategories,
    };
  }
}
