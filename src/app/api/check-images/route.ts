import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notion = new Client({ auth: process.env.NOTION_TOKEN! });
  const dbId = process.env.NOTION_PROJECTS_DB_ID!;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allResults: any[] = [];
  let cursor: string | undefined;
  do {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await notion.databases.query({
      database_id: dbId,
      filter: { property: "published", checkbox: { equals: true } },
      sorts: [{ property: "order", direction: "ascending" }],
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    allResults.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const report = allResults.map((page: any) => {
    const p = page.properties;

    // 取 cover_image（支援 files 或 url 型態）
    let coverImage = "";
    if (p["cover_image"]?.files?.length) {
      const f = p["cover_image"].files[0];
      coverImage = f?.file?.url ?? f?.external?.url ?? "";
    } else if (p["cover_image"]?.url) {
      coverImage = p["cover_image"].url;
    }

    // 取 vimeo_url（支援 url 或 rich_text 型態）
    let vimeoUrl = "";
    if (p["vimeo_url"]?.url) vimeoUrl = p["vimeo_url"].url;
    else if (p["vimeo_url"]?.rich_text?.length)
      vimeoUrl = p["vimeo_url"].rich_text.map((t: { plain_text: string }) => t.plain_text).join("");

    const title = p["title"]?.title?.map((t: { plain_text: string }) => t.plain_text).join("") ?? "";
    const order = p["order"]?.number ?? 999;

    return {
      order,
      title,
      coverImage: coverImage || "❌ 空白",
      hasImage: !!coverImage,
      vimeoUrl: vimeoUrl || "❌ 空白",
      hasVimeo: !!vimeoUrl,
      // 顯示 vimeo_url 的原始型態（方便 debug）
      vimeoRawType: Object.keys(p["vimeo_url"] ?? {}).join(", "),
    };
  });

  const missingImage = report.filter((p) => !p.hasImage);
  const missingVimeo = report.filter((p) => !p.hasVimeo);

  return NextResponse.json({
    total: report.length,
    missingImageCount: missingImage.length,
    missingVimeoCount: missingVimeo.length,
    missingImage,
    missingVimeo,
    all: report,
  });
}
