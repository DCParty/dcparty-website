import { permanentRedirect } from "next/navigation";

function normalize(slug: string): string {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // 非合法編碼序列，沿用原字串
  }
  return decoded.normalize("NFC");
}

/**
 * 網址上的 slug 與正確 slug 不同時（ID 後面被接了別的字、只有 ID 的舊網址），
 * 永久轉址到正確網址，避免同一頁出現多個網址被 Google 當成重複內容。
 * Next.js 的 permanentRedirect 回 308，Google 視同 301。
 */
export function redirectToCanonicalSlug(section: "works" | "blog", requested: string, canonical: string) {
  if (normalize(requested) !== normalize(canonical)) {
    permanentRedirect(`/${section}/${encodeURIComponent(canonical)}`);
  }
}
