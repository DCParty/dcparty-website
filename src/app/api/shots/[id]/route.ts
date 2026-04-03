import { NextRequest, NextResponse } from 'next/server';
import { notion, fieldToNotionProp } from '@/lib/notion-script';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { field, value } = await req.json();
    const props = fieldToNotionProp(field, value);
    if (!props) {
      return NextResponse.json({ error: 'Unknown field' }, { status: 400 });
    }
    await notion.pages.update({
      page_id: id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      properties: props as any,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[shots PATCH]', err);
    return NextResponse.json({ error: 'Failed to update shot' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Notion 無 DELETE，用 archive 代替
    await notion.pages.update({ page_id: id, archived: true });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[shots DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete shot' }, { status: 500 });
  }
}
