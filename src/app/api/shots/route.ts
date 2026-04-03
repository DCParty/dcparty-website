import { NextRequest, NextResponse } from 'next/server';
import { notion } from '@/lib/notion-script';

export async function POST(req: NextRequest) {
  try {
    const { projectId, sceneIndex, sceneName, shotIndex } = await req.json();

    const page = await notion.pages.create({
      parent: { database_id: process.env.NOTION_SCRIPT_SHOTS_DB_ID! },
      properties: {
        shot_code:       { title: [{ text: { content: String(shotIndex + 1) } }] },
        project:         { relation: [{ id: projectId }] },
        scene_index:     { number: sceneIndex },
        scene_name:      { rich_text: [{ text: { content: sceneName ?? '' } }] },
        shot_index:      { number: shotIndex },
        duration:        { number: 3 },
        is_alternative:  { checkbox: false },
        linked_audio:    { checkbox: false },
        approval_status: { select: { name: 'pending' } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });

    return NextResponse.json({ id: page.id });
  } catch (err) {
    console.error('[shots POST]', err);
    return NextResponse.json({ error: 'Failed to create shot' }, { status: 500 });
  }
}
