import { NextRequest, NextResponse } from "next/server";
import { getPublishedProjects } from "@/lib/notion-dcfilms";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await getPublishedProjects();
  const report = projects.map((p) => ({
    order: p.order,
    title: p.title,
    slug: p.slug,
    coverImage: p.coverImage || "❌ 空白",
    hasImage: !!p.coverImage,
  }));

  const missing = report.filter((p) => !p.hasImage);

  return NextResponse.json({
    total: projects.length,
    missingCount: missing.length,
    missing,
    all: report,
  });
}
