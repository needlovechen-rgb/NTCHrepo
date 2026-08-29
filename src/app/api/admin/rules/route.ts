import { NextResponse } from 'next/server';
import { ConditionalRuleService } from '@/services/ConditionalRuleService';

export async function GET() {
  try {
    const rules = await ConditionalRuleService.listRules();
    return NextResponse.json({ success: true, rules });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rule = await ConditionalRuleService.createRule(body);
    return NextResponse.json({ success: true, rule });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, enabled } = body;
    const rule = await ConditionalRuleService.toggleRule(id, enabled);
    return NextResponse.json({ success: true, rule });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
