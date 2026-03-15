import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, slug } = body as { type?: string; slug?: string };

    if (type === "projects" || type === "all") {
      revalidatePath("/projects", "layout");
      if (slug) revalidatePath(`/projects/${slug}`);
    }
    if (type === "blog" || type === "all") {
      revalidatePath("/blog", "layout");
      if (slug) revalidatePath(`/blog/${slug}`);
    }
    if (type === "all") {
      revalidatePath("/", "layout");
    }

    return NextResponse.json({ revalidated: true, type, slug });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
