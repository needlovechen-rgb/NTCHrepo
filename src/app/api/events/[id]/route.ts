import { NextResponse } from 'next/server';
import { FormSchemaService } from '@/services/FormSchemaService';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const formSchema = await FormSchemaService.getActiveFormSchema(params.id);
    return NextResponse.json({ success: true, ...formSchema });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
