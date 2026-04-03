import { NextRequest, NextResponse } from 'next/server';
import { notion } from '@/lib/notion-script';

// GET /api/projects — list all projects
export async function GET() {
  try {
    const res = await notion.databases.query({
      database_id: process.env.NOTION_SCRIPT_PROJECTS_DB_ID!,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    });

    const projects = res.results.map((page: any) => {
      const p = page.properties;
      return {
        id: page.id,
        name: p.name?.title?.[0]?.plain_text || '未命名專案',
        clientName: p.client_name?.rich_text?.[0]?.plain_text || '',
        platform: p.platform?.select?.name || '',
        format: p.format?.select?.name || '',
        duration: p.duration?.number ?? 15,
        videoType: p.video_type?.rich_text?.[0]?.plain_text || '',
        status: p.status?.select?.name || '草稿中',
        createdTime: page.created_time,
      };
    });

    return NextResponse.json(projects);
  } catch (err) {
    console.error('[projects GET]', err);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST /api/projects — create new project
export async function POST(req: NextRequest) {
  try {
    const { name, clientName, platform, format, duration, videoType } = await req.json();

    const page = await notion.pages.create({
      parent: { database_id: process.env.NOTION_SCRIPT_PROJECTS_DB_ID! },
      properties: {
        name: { title: [{ text: { content: name || '新專案' } }] },
        client_name: { rich_text: [{ text: { content: clientName || '' } }] },
        platform: platform ? { select: { name: platform } } : undefined,
        format: format ? { select: { name: format } } : undefined,
        duration: { number: Number(duration) || 15 },
        video_type: { rich_text: [{ text: { content: videoType || '' } }] },
        status: { select: { name: '草稿中' } },
      } as any,
    });

    return NextResponse.json({ id: page.id });
  } catch (err) {
    console.error('[projects POST]', err);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
