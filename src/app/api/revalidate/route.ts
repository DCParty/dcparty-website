import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// GET：瀏覽器直接打網址觸發（加 ?secret=xxx&type=all）
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const type = searchParams.get("type") ?? "all";

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return revalidateByType(type);
}

// POST：Notion Webhook 觸發
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type = "all" } = body as { type?: string; slug?: string };
    return revalidateByType(type);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

function revalidateByType(type: string) {
  revalidatePath("/", "layout");
  revalidatePath("/works", "layout");
  revalidatePath("/projects", "layout");
  revalidatePath("/blog", "layout");

  if (type === "works" || type === "all") {
    revalidatePath("/works/[slug]", "page");
  }
  if (type === "blog" || type === "all") {
    revalidatePath("/blog/[slug]", "page");
  }

  return NextResponse.json({ revalidated: true, type, timestamp: new Date().toISOString() });
}
