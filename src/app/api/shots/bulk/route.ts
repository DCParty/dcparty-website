import { NextRequest, NextResponse } from 'next/server';
import { notion } from '@/lib/notion-script';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function POST(req: NextRequest) {
  try {
    const { projectId, scenes } = await req.json();

    if (!projectId || !Array.isArray(scenes)) {
      return NextResponse.json({ error: 'projectId and scenes[] required' }, { status: 400 });
    }

    const allShots = scenes.flatMap((scene: any, si: number) =>
      scene.shots.map((shot: any, shi: number) => ({
        ...shot,
        scene_index: si,
        scene_name: scene.name,
        shot_index: shi,
      }))
    );

    for (const shot of allShots) {
      await notion.pages.create({
        parent: { database_id: process.env.NOTION_SCRIPT_SHOTS_DB_ID! },
        properties: {
          shot_code:       { title: [{ text: { content: shot.shotCode || String(shot.shot_index + 1) } }] },
          project:         { relation: [{ id: projectId }] },
          scene_index:     { number: shot.scene_index },
          scene_name:      { rich_text: [{ text: { content: shot.scene_name || '' } }] },
          shot_index:      { number: shot.shot_index },
          duration:        { number: Number(shot.duration) || 3 },
          is_alternative:  { checkbox: Boolean(shot.isAlternative) },
          linked_audio:    { checkbox: Boolean(shot.linkedAudio) },
          shot_size:       shot.shotSize ? { select: { name: shot.shotSize } } : undefined,
          camera_movement: shot.cameraMovement ? { select: { name: shot.cameraMovement } } : undefined,
          transition:      shot.transition ? { select: { name: shot.transition } } : undefined,
          visual:          { rich_text: [{ text: { content: String(shot.visual || '').slice(0, 2000) } }] },
          on_screen_text:  { rich_text: [{ text: { content: String(shot.onScreenText || '').slice(0, 2000) } }] },
          prompt:          { rich_text: [{ text: { content: String(shot.prompt || '').slice(0, 2000) } }] },
          ai_tool:         shot.aiTool ? { select: { name: shot.aiTool } } : undefined,
          vo:              { rich_text: [{ text: { content: String(shot.vo || '').slice(0, 2000) } }] },
          audio:           { rich_text: [{ text: { content: String(shot.audio || '').slice(0, 2000) } }] },
          approval_status: { select: { name: shot.approvalStatus || 'pending' } },
          reference_image_url: shot.image ? { url: shot.image } : undefined,
        } as any,
      });
      await delay(350);
    }

    return NextResponse.json({ ok: true, count: allShots.length });
  } catch (err) {
    console.error('[shots/bulk POST]', err);
    return NextResponse.json({ error: 'Failed to bulk create shots' }, { status: 500 });
  }
}
