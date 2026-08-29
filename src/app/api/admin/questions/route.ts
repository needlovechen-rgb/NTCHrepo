import { NextResponse } from 'next/server';
import { QuestionService } from '@/services/QuestionService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, ...payload } = body;

    if (action === 'ADD_OPTION') {
      const res = await QuestionService.addOption(payload.questionId, payload);
      return NextResponse.json({ success: true, ...res });
    }

    if (action === 'UPDATE_OPTION') {
      const res = await QuestionService.updateOptionVersion(payload.optionId, payload);
      return NextResponse.json({ success: true, optionVersion: res });
    }

    // 建立新題目
    const question = await QuestionService.createQuestion(payload);
    return NextResponse.json({ success: true, question });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, action, enabled, ...data } = body;

    if (action === 'TOGGLE_ENABLED') {
      const res = await QuestionService.toggleQuestionEnabled(id, enabled);
      return NextResponse.json({ success: true, question: res });
    }

    // 題目更新（自動 Version Bump）
    const res = await QuestionService.updateQuestionWithNewVersion(id, data);
    return NextResponse.json({ success: true, ...res });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
