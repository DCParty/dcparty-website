/** 清理文字為 URL slug（支援多語言字元） */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * 以 8 碼 Notion ID 前綴 + 標題 slug 組合成唯一 slug。
 * 例如：page id "31acb760-e921-8038-..." + title "品牌視覺設計"
 *   → "31acb760-品牌視覺設計"
 */
export function slugifyWithId(title: string, notionId: string): string {
  const shortId = notionId.replace(/-/g, "").slice(0, 8);
  const titleSlug = slugify(title);
  return titleSlug ? `${shortId}-${titleSlug}` : shortId;
}

/** 從混合 slug 取出 8 碼 ID 前綴 */
export function extractIdPrefix(slug: string): string {
  return slug.split("-")[0];
}
