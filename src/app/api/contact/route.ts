import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const NOTION_CONTACT_DB = process.env.NOTION_DATABASE_ID_CONTACT;

export async function POST(request: Request) {
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

  const notion = new Client({ auth: key });

  try {
    const db = await notion.databases.retrieve({ database_id: NOTION_CONTACT_DB });

    const properties: Record<string, unknown> = {
      姓名: { title: [{ text: { content: name.slice(0, 2000) } }] },
      Email: { email: email.slice(0, 2000) },
      需求說明: { rich_text: [{ text: { content: message.slice(0, 2000) } }] },
      處理狀態: { select: { name: "待處理" } },
    };
    if (phone) {
      properties["電話"] = { phone_number: phone.slice(0, 2000) };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await notion.pages.create({
      parent: { database_id: NOTION_CONTACT_DB },
      properties: properties as any,
    });

    return NextResponse.json({ ok: true, message: "已送出，我們會盡快回覆。" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Notion] contact submit 錯誤:", message);
    if (message.includes("object_not_found") || message.includes("Could not find")) {
      return NextResponse.json(
        { error: "聯絡表單資料庫未分享給 Integration，請在 Notion 對該資料庫加 Connections。" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "送出失敗，請稍後再試。" }, { status: 500 });
  }
}
