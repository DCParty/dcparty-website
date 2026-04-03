import { notion } from '@/lib/notion-script';
import ScriptManager from '@/components/ScriptManager';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

async function getProject(id: string) {
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = (page as any).properties;
    return {
      id: page.id,
      name: p.name?.title?.[0]?.plain_text || '未命名專案',
      clientName: p.client_name?.rich_text?.[0]?.plain_text || '',
      platform: p.platform?.select?.name || '',
      format: p.format?.select?.name || '',
      duration: p.duration?.number ?? 15,
      videoType: p.video_type?.rich_text?.[0]?.plain_text || '',
      status: p.status?.select?.name || '草稿中',
    };
  } catch {
    return null;
  }
}

export default async function ScriptEditorPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return <ScriptManager projectId={id} projectData={project} />;
}
