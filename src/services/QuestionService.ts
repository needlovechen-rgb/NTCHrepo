import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export class QuestionService {
  /**
   * 新增題目（自動建立 QuestionVersion 1）
   */
  static async createQuestion(data: {
    categoryId: string;
    key: string;
    title: string;
    type: string;
    required?: boolean;
    description?: string;
    sortOrder?: number;
    options?: Array<{ label: string; value: string }>;
    createdBy?: string;
  }) {
    const qId = `q_${data.key.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
    const qvId = `qv_${data.key}_01`;

    const question = await prisma.question.create({
      data: {
        id: qId,
        categoryId: data.categoryId,
        key: data.key,
        type: data.type,
        required: data.required ?? false,
        sortOrder: data.sortOrder ?? 10,
        enabled: true,
        currentVersionId: qvId,
      },
    });

    await prisma.questionVersion.create({
      data: {
        id: qvId,
        questionId: qId,
        version: 1,
        title: data.title,
        description: data.description || null,
        type: data.type,
        required: data.required ?? false,
        isActive: true,
        createdBy: data.createdBy || null,
      },
    });

    // 若有提供選項
    if (data.options && data.options.length > 0) {
      for (let i = 0; i < data.options.length; i++) {
        const opt = data.options[i];
        const optId = `opt_${data.key}_${opt.value.replace(/[^a-z0-9_]/g, '_')}`;
        const ovId = `ov_${data.key}_${opt.value.replace(/[^a-z0-9_]/g, '_')}_01`;

        await prisma.option.create({
          data: {
            id: optId,
            questionId: qId,
            currentVersionId: ovId,
            enabled: true,
          },
        });

        await prisma.optionVersion.create({
          data: {
            id: ovId,
            optionId: optId,
            version: 1,
            label: opt.label,
            value: opt.value,
            sortOrder: (i + 1) * 10,
            isActive: true,
            createdBy: data.createdBy || null,
          },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        id: `audit_${uuidv4().substring(0, 8)}`,
        action: 'CREATE_QUESTION',
        entityType: 'Question',
        entityId: qId,
        after: JSON.stringify({ question, title: data.title }),
      },
    });

    return question;
  }

  /**
   * 更新題目（建立新版本 Version Bump，不覆蓋舊版本）
   */
  static async updateQuestionWithNewVersion(
    questionId: string,
    data: {
      title?: string;
      description?: string;
      type?: string;
      required?: boolean;
      sortOrder?: number;
      enabled?: boolean;
      categoryId?: string;
      createdBy?: string;
    }
  ) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        versions: { orderBy: { version: 'desc' }, take: 1 },
      },
    });

    if (!question) throw new Error('Question not found');

    const lastVer = question.versions[0];
    const newVerNum = (lastVer?.version || 1) + 1;
    const newQvId = `qv_${question.key}_${String(newVerNum).padStart(2, '0')}`;

    // 將舊版本標記為非 active
    await prisma.questionVersion.updateMany({
      where: { questionId },
      data: { isActive: false },
    });

    // 建立新版本
    const newVersion = await prisma.questionVersion.create({
      data: {
        id: newQvId,
        questionId,
        version: newVerNum,
        title: data.title ?? lastVer?.title ?? question.key,
        description: data.description !== undefined ? data.description : lastVer?.description,
        type: data.type ?? lastVer?.type ?? question.type,
        required: data.required ?? lastVer?.required ?? question.required,
        isActive: true,
        createdBy: data.createdBy || null,
      },
    });

    // 更新 Question 主表的 currentVersionId 與屬性
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        currentVersionId: newQvId,
        ...(data.type && { type: data.type }),
        ...(data.required !== undefined && { required: data.required }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.enabled !== undefined && { enabled: data.enabled }),
        ...(data.categoryId && { categoryId: data.categoryId }),
      },
    });

    await prisma.auditLog.create({
      data: {
        id: `audit_${uuidv4().substring(0, 8)}`,
        action: 'UPDATE_QUESTION_VERSION',
        entityType: 'Question',
        entityId: questionId,
        before: JSON.stringify(lastVer),
        after: JSON.stringify(newVersion),
      },
    });

    return { question: updatedQuestion, version: newVersion };
  }

  /**
   * 題目軟刪除 / 啟用切換
   */
  static async toggleQuestionEnabled(questionId: string, enabled: boolean) {
    const res = await prisma.question.update({
      where: { id: questionId },
      data: { enabled },
    });

    await prisma.auditLog.create({
      data: {
        id: `audit_${uuidv4().substring(0, 8)}`,
        action: enabled ? 'ENABLE_QUESTION' : 'DISABLE_QUESTION',
        entityType: 'Question',
        entityId: questionId,
      },
    });

    return res;
  }

  /**
   * 為題目新增選項
   */
  static async addOption(
    questionId: string,
    data: { label: string; value: string; sortOrder?: number; createdBy?: string }
  ) {
    const q = await prisma.question.findUnique({ where: { id: questionId } });
    if (!q) throw new Error('Question not found');

    const optId = `opt_${q.key}_${data.value.replace(/[^a-z0-9_]/g, '_')}`;
    const ovId = `ov_${q.key}_${data.value.replace(/[^a-z0-9_]/g, '_')}_01`;

    const option = await prisma.option.create({
      data: {
        id: optId,
        questionId,
        currentVersionId: ovId,
        enabled: true,
      },
    });

    const optionVersion = await prisma.optionVersion.create({
      data: {
        id: ovId,
        optionId: optId,
        version: 1,
        label: data.label,
        value: data.value,
        sortOrder: data.sortOrder ?? 10,
        isActive: true,
        createdBy: data.createdBy || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        id: `audit_${uuidv4().substring(0, 8)}`,
        action: 'CREATE_OPTION',
        entityType: 'Option',
        entityId: optId,
        after: JSON.stringify(optionVersion),
      },
    });

    return { option, optionVersion };
  }

  /**
   * 更新選項（標籤文字變更自動升版）
   */
  static async updateOptionVersion(
    optionId: string,
    data: { label?: string; sortOrder?: number; enabled?: boolean; createdBy?: string }
  ) {
    const opt = await prisma.option.findUnique({
      where: { id: optionId },
      include: {
        versions: { orderBy: { version: 'desc' }, take: 1 },
      },
    });
    if (!opt) throw new Error('Option not found');

    if (data.enabled !== undefined) {
      await prisma.option.update({
        where: { id: optionId },
        data: { enabled: data.enabled },
      });
    }

    if (data.label) {
      const lastVer = opt.versions[0];
      const newVerNum = (lastVer?.version || 1) + 1;
      const newOvId = `${optionId}_v${String(newVerNum).padStart(2, '0')}`;

      await prisma.optionVersion.updateMany({
        where: { optionId },
        data: { isActive: false },
      });

      const newVersion = await prisma.optionVersion.create({
        data: {
          id: newOvId,
          optionId,
          version: newVerNum,
          label: data.label,
          value: lastVer?.value || optionId,
          sortOrder: data.sortOrder ?? lastVer?.sortOrder ?? 0,
          isActive: true,
          createdBy: data.createdBy || null,
        },
      });

      await prisma.option.update({
        where: { id: optionId },
        data: { currentVersionId: newOvId },
      });

      await prisma.auditLog.create({
        data: {
          id: `audit_${uuidv4().substring(0, 8)}`,
          action: 'UPDATE_OPTION_VERSION',
          entityType: 'Option',
          entityId: optionId,
          before: JSON.stringify(lastVer),
          after: JSON.stringify(newVersion),
        },
      });

      return newVersion;
    }

    return opt;
  }
}
