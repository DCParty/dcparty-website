import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const NOTION_CONTACT_DB = process.env.NOTION_DATABASE_ID_CONTACT;

// ─── Rate limiting ─────────────────────────────────────────────
// 注意：Vercel 無伺服器多實例環境下，此 Map 僅限單一 instance 有效。
// 仍可減少單一 instance 的濫用，搭配 Origin 驗證一起防護。
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  // 清除過期項目，防止記憶體洩漏
  if (rateLimitMap.size > 500) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

// ─── Origin 驗證（CSRF 防護）────────────────────────────────────
function isValidOrigin(origin: string | null): boolean {
  if (!origin) return true; // 無 Origin header（非瀏覽器請求）允許通過
  if (process.env.NODE_ENV === "development") return true;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl && origin === siteUrl) return true;
  // 允許 Vercel preview deployments
  if (origin.endsWith(".vercel.app")) return true;
  return false;
}

// ─── Email 格式驗證（更嚴格的 RFC 5321 子集）────────────────────
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export async function POST(request: Request) {
  // CSRF：驗證 Origin header
  const origin = request.headers.get("origin");
  if (!isValidOrigin(origin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "提交太頻繁，請稍後再試。" },
      { status: 429 }
    );
  }

  if (!NOTION_CONTACT_DB) {
    return NextResponse.json(
      { error: "NOTION_DATABASE_ID_CONTACT 未設定，請在 .env.local 設定聯絡表單資料庫 ID。" },
      { status: 503 }
    );
  }

  const key = process.env.NOTION_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Notion API 未設定" }, { status: 503 });
  }

  let body: { name?: string; email?: string; phone?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "請提供 JSON：name, email, message" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email) {
    return NextResponse.json({ error: "請填寫姓名與 Email" }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Email 格式不正確" }, { status: 400 });
  }

  const notion = new Client({ auth: key });

  try {
    const properties: Record<string, unknown> = {
      姓名: { title: [{ text: { content: name.slice(0, 2000) } }] },
      Email: { email: email.slice(0, 200) },
      需求說明: { rich_text: [{ text: { content: message.slice(0, 2000) } }] },
      處理狀態: { select: { name: "待處理" } },
    };
    if (phone) {
      properties["電話"] = { phone_number: phone.slice(0, 50) };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await notion.pages.create({
      parent: { database_id: NOTION_CONTACT_DB },
      properties: properties as any,
    });

    return NextResponse.json({ ok: true, message: "已送出，我們會盡快回覆。" });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[Notion] contact submit 錯誤:", errMsg);
    if (errMsg.includes("object_not_found") || errMsg.includes("Could not find")) {
      return NextResponse.json(
        { error: "聯絡表單資料庫未分享給 Integration，請在 Notion 對該資料庫加 Connections。" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "送出失敗，請稍後再試。" }, { status: 500 });
  }
}
