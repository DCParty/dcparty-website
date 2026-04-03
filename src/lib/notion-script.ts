import { Client } from '@notionhq/client';

export const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Notion page → Shot 物件
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const notionPageToShot = (page: any) => {
  const p = page.properties;
  return {
    id: page.id,
    shotCode:        p.shot_code?.title?.[0]?.plain_text || '',
    isAlternative:   p.is_alternative?.checkbox ?? false,
    linkedAudio:     p.linked_audio?.checkbox ?? false,
    duration:        p.duration?.number ?? 3,
    shotSize:        p.shot_size?.select?.name || '中景 (MS)',
    cameraMovement:  p.camera_movement?.select?.name || '固定鏡頭 (Static)',
    transition:      p.transition?.select?.name || '硬切 (Cut)',
    visual:          p.visual?.rich_text?.[0]?.plain_text || '',
    onScreenText:    p.on_screen_text?.rich_text?.[0]?.plain_text || '',
    prompt:          p.prompt?.rich_text?.[0]?.plain_text || '',
    aiTool:          p.ai_tool?.select?.name || 'Seedance 2.0',
    vo:              p.vo?.rich_text?.[0]?.plain_text || '',
    audio:           p.audio?.rich_text?.[0]?.plain_text || '',
    clientFeedback:  p.client_feedback?.rich_text?.[0]?.plain_text || '',
    approvalStatus:  p.approval_status?.select?.name || 'pending',
    image:           p.reference_image_url?.url || null,
  };
};

// Shots[] → scenes[] （前端格式）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const groupShotsByScene = (pages: any[]) => {
  const scenes: any[] = [];

  const sorted = [...pages].sort((a, b) => {
    const si = (a.properties.scene_index?.number ?? 0) - (b.properties.scene_index?.number ?? 0);
    return si !== 0 ? si : (a.properties.shot_index?.number ?? 0) - (b.properties.shot_index?.number ?? 0);
  });

  sorted.forEach(page => {
    const si = page.properties.scene_index?.number ?? 0;
    if (!scenes[si]) {
      scenes[si] = {
        id: `scene-${si}`,
        name: page.properties.scene_name?.rich_text?.[0]?.plain_text || '',
        shots: [],
      };
    }
    scenes[si].shots.push(notionPageToShot(page));
  });

  return scenes.filter(Boolean);
};

// field name → Notion property 格式
export const fieldToNotionProp = (field: string, value: unknown) => {
  const rt = (v: unknown) => [{ text: { content: String(v ?? '').slice(0, 2000) } }];

  const map: Record<string, Record<string, unknown>> = {
    shotCode:        { shot_code: { title: rt(value) } },
    isAlternative:   { is_alternative: { checkbox: Boolean(value) } },
    linkedAudio:     { linked_audio: { checkbox: Boolean(value) } },
    duration:        { duration: { number: Number(value) } },
    shotSize:        { shot_size: { select: { name: value } } },
    cameraMovement:  { camera_movement: { select: { name: value } } },
    transition:      { transition: { select: { name: value } } },
    visual:          { visual: { rich_text: rt(value) } },
    onScreenText:    { on_screen_text: { rich_text: rt(value) } },
    prompt:          { prompt: { rich_text: rt(value) } },
    aiTool:          { ai_tool: { select: { name: value } } },
    vo:              { vo: { rich_text: rt(value) } },
    audio:           { audio: { rich_text: rt(value) } },
    clientFeedback:  { client_feedback: { rich_text: rt(value) } },
    approvalStatus:  { approval_status: { select: { name: value } } },
    image:           { reference_image_url: { url: value } },
    scene_name:      { scene_name: { rich_text: rt(value) } },
    scene_index:     { scene_index: { number: Number(value) } },
    shot_index:      { shot_index: { number: Number(value) } },
  };

  return map[field] ?? null;
};
