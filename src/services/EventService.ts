import { prisma } from '@/lib/db';
import { FormSchemaService } from './FormSchemaService';
import { v4 as uuidv4 } from 'uuid';

export class EventService {
  /**
   * 建立新演出
   */
  static async createEvent(data: {
    name: string;
    eventDate: string;
    venueId?: string;
    formUser?: string;
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
    notes?: string;
    createdBy?: string;
  }) {
    const event = await prisma.event.create({
      data: {
        id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: data.name,
        eventDate: new Date(data.eventDate),
        venueId: data.venueId || null,
        formUser: data.formUser || '',
        contactPerson: data.contactPerson || '',
        contactPhone: data.contactPhone || '',
        contactEmail: data.contactEmail || '',
        notes: data.notes || '',
        status: 'draft',
        createdBy: data.createdBy || null,
      },
    });
    return event;
  }

  /**
   * 取得演出列表
   */
  static async listEvents(query?: { search?: string; status?: string }) {
    const where: any = {};
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search } },
        { formUser: { contains: query.search } },
        { venue: { name: { contains: query.search } } },
      ];
    }

    return prisma.event.findMany({
      where,
      include: { venue: true },
      orderBy: { eventDate: 'desc' },
    });
  }

  /**
   * 自動儲存草稿回答 (Draft Auto-save)
   */
  static async saveDraft(
    eventId: string,
    eventInfo: {
      name?: string;
      eventDate?: string;
      venueId?: string;
      formUser?: string;
      contactPerson?: string;
      contactPhone?: string;
      contactEmail?: string;
      notes?: string;
    },
    answers: Array<{
      questionId: string;
      questionVersionId: string;
      optionId?: string;
      optionVersionId?: string;
      value: any;
      valueType: string;
    }>
  ) {
    // 1. 更新 Event 基本資料
    await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(eventInfo.name && { name: eventInfo.name }),
        ...(eventInfo.eventDate && { eventDate: new Date(eventInfo.eventDate) }),
        ...(eventInfo.venueId !== undefined && { venueId: eventInfo.venueId || null }),
        ...(eventInfo.formUser !== undefined && { formUser: eventInfo.formUser }),
        ...(eventInfo.contactPerson !== undefined && { contactPerson: eventInfo.contactPerson }),
        ...(eventInfo.contactPhone !== undefined && { contactPhone: eventInfo.contactPhone }),
        ...(eventInfo.contactEmail !== undefined && { contactEmail: eventInfo.contactEmail }),
        ...(eventInfo.notes !== undefined && { notes: eventInfo.notes }),
      },
    });

    // 2. 批次儲存 / 覆蓋 Answers
    for (const ans of answers) {
      const existing = await prisma.answer.findFirst({
        where: {
          eventId,
          questionId: ans.questionId,
        },
      });

      const stringifiedValue =
        typeof ans.value === 'object' ? JSON.stringify(ans.value) : String(ans.value ?? '');

      if (existing) {
        await prisma.answer.update({
          where: { id: existing.id },
          data: {
            questionVersionId: ans.questionVersionId,
            optionId: ans.optionId || null,
            optionVersionId: ans.optionVersionId || null,
            value: stringifiedValue,
            valueType: ans.valueType,
          },
        });
      } else {
        await prisma.answer.create({
          data: {
            id: `ans_${uuidv4().substring(0, 8)}`,
            eventId,
            questionId: ans.questionId,
            questionVersionId: ans.questionVersionId,
            optionId: ans.optionId || null,
            optionVersionId: ans.optionVersionId || null,
            value: stringifiedValue,
            valueType: ans.valueType,
          },
        });
      }
    }

    return { success: true, savedAt: new Date().toISOString() };
  }

  /**
   * 正式提交問卷並鎖定 Event Questionnaire Snapshot
   */
  static async submitEvent(eventId: string) {
    // 取得當時完整 Schema
    const schema = await FormSchemaService.getActiveFormSchema(eventId);

    // 儲存快照
    await prisma.eventSnapshot.upsert({
      where: { eventId },
      create: {
        id: `snap_${uuidv4().substring(0, 8)}`,
        eventId,
        snapshotData: JSON.stringify(schema),
      },
      update: {
        snapshotData: JSON.stringify(schema),
      },
    });

    // 更新 Event 狀態為 submitted
    const updated = await prisma.event.update({
      where: { id: eventId },
      data: { status: 'submitted' },
    });

    return updated;
  }

  /**
   * 複製演出 (Event Copy)
   */
  static async copyEvent(sourceEventId: string, newName: string, newDate: string) {
    const source = await prisma.event.findUnique({
      where: { id: sourceEventId },
      include: { answers: true },
    });

    if (!source) throw new Error('Source event not found');

    const newEventId = `evt_${Date.now()}_copy`;

    const newEvent = await prisma.event.create({
      data: {
        id: newEventId,
        name: newName,
        eventDate: new Date(newDate),
        venueId: source.venueId,
        formUser: source.formUser,
        contactPerson: source.contactPerson,
        contactPhone: source.contactPhone,
        contactEmail: source.contactEmail,
        notes: source.notes,
        status: 'draft',
        createdBy: source.createdBy,
      },
    });

    // 複製所有回答
    for (const ans of source.answers) {
      await prisma.answer.create({
        data: {
          id: `ans_${uuidv4().substring(0, 8)}`,
          eventId: newEventId,
          questionId: ans.questionId,
          questionVersionId: ans.questionVersionId,
          optionId: ans.optionId,
          optionVersionId: ans.optionVersionId,
          value: ans.value,
          valueType: ans.valueType,
        },
      });
    }

    return newEvent;
  }
}
