import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 偵測舊的 UUID 格式 URL（如 /services/31acb760-e921-8038-...）
 * 並 301 導向首頁對應 section，避免 404。
 */
export function middleware(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/");
  if (segments.length === 3) {
    const [, section, param] = segments;
    if (
      ["services", "works", "blog"].includes(section) &&
      UUID_RE.test(param)
    ) {
      const fallback =
        section === "services"
          ? "/#services"
          : section === "works"
            ? "/#work"
            : `/${section}`;
      return NextResponse.redirect(new URL(fallback, request.url), 301);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/services/:path*", "/works/:path*", "/blog/:path*"],
};
