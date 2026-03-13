import { NextResponse } from "next/server";

/**
 * 除錯用：列出目前 Integration 能存取的「資料庫」。
 * 開發環境直接可存取；正式/預覽環境需帶 ?token=NOTION_DEBUG_TOKEN 才能存取。
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    const debugToken = process.env.NOTION_DEBUG_TOKEN;
    const requestToken = new URL(request.url).searchParams.get("token");
    if (!debugToken || requestToken !== debugToken) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }
  const key = process.env.NOTION_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "缺少 NOTION_API_KEY", databases: [] },
      { status: 200 }
    );
  }

  const wantedIds = [
    process.env.NOTION_DATABASE_ID_A,
    process.env.NOTION_DATABASE_ID_B,
    process.env.NOTION_DATABASE_ID_C,
    process.env.NOTION_DATABASE_ID_D,
    process.env.NOTION_DATABASE_ID_E,
    process.env.NOTION_DATABASE_ID_F,
    process.env.NOTION_DATABASE_ID_CONTACT,
  ].filter(Boolean) as string[];

  try {
    // Notion Search API：只回傳已分享給此 Integration 的項目（filter 用 database 或 data_source）
    const res = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        filter: { property: "object", value: "database" },
        page_size: 100,
      }),
    });

    const data = (await res.json()) as {
      results?: Array<{
        object: string;
        id: string;
        title?: Array<{ plain_text: string }>;
      }>;
      code?: string;
      message?: string;
    };

    if (!res.ok) {
      return NextResponse.json({
        error: "Notion API 回傳錯誤",
        status: res.status,
        code: data.code,
        message: data.message,
        hint: "若為 invalid_request 或 object_not_found，請確認 NOTION_API_KEY 與 Integration 所屬 workspace 一致，且資料庫已分享給該 Integration。",
      });
    }

    const results = data.results || [];
    const databases = results.map((item) => ({
      id: item.id,
      idNoHyphens: item.id.replace(/-/g, ""),
      title: item.title?.map((t) => t.plain_text).join("") || "(無標題)",
    }));

    const foundIds = new Set(databases.map((d) => d.idNoHyphens.toLowerCase()));
    const missing = wantedIds.filter((id) => !foundIds.has(id.replace(/-/g, "").toLowerCase()));

    return NextResponse.json({
      message:
        missing.length > 0
          ? "以下 .env 的資料庫 ID 尚未分享給此 Integration，請在 Notion 對「每個」資料庫加 Connections。"
          : "所有 .env 中的資料庫皆已在此 Integration 的存取清單中。",
      integrationCanAccessCount: databases.length,
      databases,
      envDatabaseIds: wantedIds,
      missingFromIntegration: missing,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: "Notion API 呼叫失敗",
        detail: message,
        hint: "請確認 NOTION_API_KEY 正確，且該 Integration 已存在於 Notion (my-integrations)。",
      },
      { status: 200 }
    );
  }
}
