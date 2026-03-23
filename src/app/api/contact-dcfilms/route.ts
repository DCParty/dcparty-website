import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, service, budget, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey || resendKey.startsWith("（")) {
      // RESEND_API_KEY not yet configured — log and return success for dev
      console.log("[Contact] Resend not configured. Form submission:", body);
      return NextResponse.json({ ok: true });
    }

    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: "DC Films Website <noreply@dcfilms.tv>",
      to: ["hello@dcfilms.tv"],
      replyTo: email,
      subject: `[DC Films 詢問] ${service || "專案洽詢"} — ${name}`,
      text: `姓名：${name}\n信箱：${email}\n電話：${phone || "未填寫"}\n需求類型：${service || "未選擇"}\n預算範圍：${budget || "未選擇"}\n\n專案簡述：\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[Contact] Error:", (err as Error).message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
