import { NextRequest, NextResponse } from 'next/server';
import { notion, groupShotsByScene } from '@/lib/notion-script';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await notion.databases.query({
      database_id: process.env.NOTION_SCRIPT_SHOTS_DB_ID!,
      filter: { property: 'project', relation: { contains: id } },
      sorts: [
        { property: 'scene_index', direction: 'ascending' },
        { property: 'shot_index', direction: 'ascending' },
      ],
    });
    return NextResponse.json(groupShotsByScene(res.results));
  } catch (err) {
    console.error('[shots GET]', err);
    return NextResponse.json({ error: 'Failed to fetch shots' }, { status: 500 });
  }
}
