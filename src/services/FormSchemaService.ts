import { prisma } from '@/lib/db';
import { CategoryItem, ConditionalRuleItem, FormSchema } from '@/types/schema';

export class FormSchemaService {
  /**
   * 取得目前有效發布的表單結構 (Active Form Schema)
   */
  static async getActiveFormSchema(eventId?: string): Promise<FormSchema> {
    // 1. 取得啟用的分類 (依 sortOrder 排序)
    const categories = await prisma.category.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        questions: {
          where: { enabled: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            versions: {
              where: { isActive: true },
              orderBy: { version: 'desc' },
              take: 1,
            },
            options: {
              where: { enabled: true },
              include: {
                versions: {
                  where: { isActive: true },
                  orderBy: { version: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    // 轉換為前端乾淨的 CategoryItem 結構
    const formattedCategories: CategoryItem[] = categories.map((cat) => ({
      id: cat.id,
      key: cat.key,
      name: cat.name,
      sortOrder: cat.sortOrder,
      enabled: cat.enabled,
      questions: cat.questions.map((q) => {
        const activeVer = q.versions[0] || {
          id: `qv_${q.key}_default`,
          version: 1,
          title: q.key,
          description: null,
          type: q.type,
          required: q.required,
        };

        const sortedOptions = q.options
          .map((opt) => {
            const activeOptVer = opt.versions[0] || {
              id: `ov_${opt.id}_default`,
              version: 1,
              label: '未命名選項',
              value: opt.id,
              sortOrder: 0,
              isActive: true,
            };

            return {
              id: opt.id,
              questionId: q.id,
              versionId: activeOptVer.id,
              version: activeOptVer.version,
              label: activeOptVer.label,
              value: activeOptVer.value,
              sortOrder: activeOptVer.sortOrder,
              enabled: opt.enabled,
              isActive: activeOptVer.isActive,
            };
          })
          .sort((a, b) => a.sortOrder - b.sortOrder);

        return {
          id: q.id,
          categoryId: q.categoryId,
          key: q.key,
          type: q.type as any,
          required: activeVer.required,
          enabled: q.enabled,
          sortOrder: q.sortOrder,
          versionId: activeVer.id,
          version: activeVer.version,
          title: activeVer.title,
          description: activeVer.description || undefined,
          options: sortedOptions,
        };
      }),
    }));

    // 2. 取得所有啟用的條件邏輯 (Conditional Rules)
    const dbRules = await prisma.conditionalRule.findMany({
      where: { enabled: true },
    });

    const rules: ConditionalRuleItem[] = dbRules.map((r) => {
      let targetIds: string[] = [];
      let logicGrp = undefined;
      try {
        targetIds = JSON.parse(r.targetQuestionIds);
      } catch {
        targetIds = [r.targetQuestionIds];
      }

      if (r.logicGroup) {
        try {
          logicGrp = JSON.parse(r.logicGroup);
        } catch {
          logicGrp = undefined;
        }
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
        logicGroup: logicGrp,
        enabled: r.enabled,
      };
    });

    // 3. 若有傳入 eventId，載入演出資訊與既有回答
    let eventData = undefined;
    const answersMap: Record<string, any> = {};

    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { venue: true, answers: true },
      });

      if (event) {
        eventData = {
          id: event.id,
          name: event.name,
          eventDate: event.eventDate.toISOString().split('T')[0],
          venueId: event.venueId || undefined,
          venueName: event.venue?.name || undefined,
          formUser: event.formUser || '',
          contactPerson: event.contactPerson || '',
          contactPhone: event.contactPhone || '',
          contactEmail: event.contactEmail || '',
          notes: event.notes || '',
          status: event.status as any,
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString(),
        };

        for (const ans of event.answers) {
          let val: any = ans.value;
          try {
            val = JSON.parse(ans.value);
          } catch {
            val = ans.value;
          }

          answersMap[ans.questionId] = {
            id: ans.id,
            eventId: ans.eventId,
            questionId: ans.questionId,
            questionVersionId: ans.questionVersionId,
            optionId: ans.optionId || undefined,
            optionVersionId: ans.optionVersionId || undefined,
            value: val,
            valueType: ans.valueType as any,
          };
        }
      }
    }

    return {
      categories: formattedCategories,
      rules,
      event: eventData,
      answers: answersMap,
    };
  }
}
