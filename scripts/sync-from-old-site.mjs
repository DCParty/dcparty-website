/**
 * 從舊網站 dcfilms.tv 抓每個作品的正確圖片和 Vimeo ID，
 * 然後更新 Notion 資料庫的 cover_image 和 vimeo_url 欄位。
 *
 * 使用方法：
 *   node scripts/sync-from-old-site.mjs
 *   node scripts/sync-from-old-site.mjs --dry-run   # 只印出，不寫入 Notion
 */

import { Client } from "@notionhq/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// 讀取 .env.local
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const envVars = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const NOTION_TOKEN = envVars.NOTION_TOKEN;
const NOTION_PROJECTS_DB_ID = envVars.NOTION_PROJECTS_DB_ID;
const DRY_RUN = process.argv.includes("--dry-run");

// Notion slug → 舊網站 slug（兩者不一致時手動對應）
const SLUG_MAP = {
  "3dmaxtrac-car-mat": "3dmaxtrac",
  "amogoodfood-pineapple-cake": "amogoodfood",
  "dyaco-brand-film": "dyaco",
  "dynamic-picosecond-visual": "dynamic",
  "milano-visual-planning": "milano",
  "new-taipei-electricity-festival": "electricity",
  "omron-visual-planning": "omron",
  "paul-smith-visual": "paul-smith",
  "pusan-village-documentary": "pusan",
  "queenwei-puppet-mv": "queen",
  "rc-release-visual": "rc-release",
};

const notion = new Client({ auth: NOTION_TOKEN });

// ── 工具函式 ──────────────────────────────────────────
async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; DCFilmsBot/1.0)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function extractVimeoId(html) {
  // player.vimeo.com/video/123456
  const m = html.match(/player\.vimeo\.com\/video\/(\d+)/);
  return m ? m[1] : null;
}

function extractMainImage(html) {
  // 找所有 wp-content/uploads 圖片（via zapwp CDN 或直連）
  const all = [
    ...[...html.matchAll(/u:https:\/\/(?:www\.)?dcfilms\.tv\/(wp-content\/uploads\/[^"'&\s]+\.(?:jpg|jpeg|png|webp))/gi)].map((m) => m[1]),
    ...[...html.matchAll(/src="https:\/\/(?:www\.)?dcfilms\.tv\/(wp-content\/uploads\/[^"']+\.(?:jpg|jpeg|png|webp))"/gi)].map((m) => m[1]),
  ];

  // 去重、過濾 logo / 頭像 / 縮圖
  const SKIP = /logo|avatar|portrait|author|人像|拷貝|-\d+x\d+\./i;
  const candidates = [...new Set(all)].filter((p) => !SKIP.test(p));

  if (!candidates.length) return null;

  // 優先選含年份上傳路徑且寬幅命名（1920 / 192 開頭）的
  const wide = candidates.find((p) => /\/1920?\d{2,}/.test(p));
  return `https://dcfilms.tv/${wide ?? candidates[0]}`;
}

// ── 抓舊網站所有作品資訊 ──────────────────────────────
async function scrapeOldSite() {
  const listHtml = await fetchHtml("https://dcfilms.tv/projects/");
  const slugs = [...new Set(
    [...listHtml.matchAll(/href="https?:\/\/dcfilms\.tv\/portfolio\/([^"\/]+)\//g)]
      .map((m) => m[1])
  )];
  console.log(`找到 ${slugs.length} 個作品`);

  const results = {};
  for (const slug of slugs) {
    try {
      const html = await fetchHtml(`https://dcfilms.tv/portfolio/${slug}/`);
      const vimeoId = extractVimeoId(html);
      const image = extractMainImage(html);
      results[slug] = {
        vimeoUrl: vimeoId ? `https://vimeo.com/${vimeoId}` : null,
        coverImage: image,
      };
      console.log(`  ✓ ${slug}  vimeo:${vimeoId ?? "—"}  img:${image ? "✓" : "❌"}`);
    } catch (e) {
      console.log(`  ✗ ${slug}  ${e.message}`);
    }
    // 避免打太快
    await new Promise((r) => setTimeout(r, 300));
  }
  return results;
}

// ── 讀 Notion 全部專案 ────────────────────────────────
async function getNotionProjects() {
  const pages = [];
  let cursor;
  do {
    const res = await notion.databases.query({
      database_id: NOTION_PROJECTS_DB_ID,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return pages;
}

// ── 主程式 ────────────────────────────────────────────
async function main() {
  console.log(DRY_RUN ? "=== DRY RUN ===" : "=== 開始同步 ===");

  const [oldSiteData, notionPages] = await Promise.all([
    scrapeOldSite(),
    getNotionProjects(),
  ]);

  let updated = 0;
  let skipped = 0;

  for (const page of notionPages) {
    const p = page.properties;
    // slug 欄位
    const slug = p["slug"]?.rich_text?.map((t) => t.plain_text).join("") ?? "";
    if (!slug) { skipped++; continue; }

    const oldSiteSlug = SLUG_MAP[slug] ?? slug;
    const oldData = oldSiteData[oldSiteSlug];
    if (!oldData) {
      console.log(`⚠️  Notion slug "${slug}" 在舊網站找不到對應`);
      skipped++;
      continue;
    }

    const currentCover = p["cover_image"]?.url ?? "";
    const currentVimeo = p["vimeo_url"]?.url ?? "";

    const newCover = oldData.coverImage;
    const newVimeo = oldData.vimeoUrl;

    const needsCoverUpdate = newCover && currentCover !== newCover;
    const needsVimeoUpdate = newVimeo && currentVimeo !== newVimeo;

    if (!needsCoverUpdate && !needsVimeoUpdate) {
      skipped++;
      continue;
    }

    console.log(`\n📝 ${slug}`);
    if (needsCoverUpdate) console.log(`   cover: ${currentCover || "空"} → ${newCover}`);
    if (needsVimeoUpdate) console.log(`   vimeo: ${currentVimeo || "空"} → ${newVimeo}`);

    if (!DRY_RUN) {
      const props = {};
      if (needsCoverUpdate) props["cover_image"] = { url: newCover };
      if (needsVimeoUpdate) props["vimeo_url"] = { url: newVimeo };
      await notion.pages.update({ page_id: page.id, properties: props });
      await new Promise((r) => setTimeout(r, 300));
    }
    updated++;
  }

  console.log(`\n完成！更新 ${updated} 筆，跳過 ${skipped} 筆${DRY_RUN ? "（DRY RUN 未實際寫入）" : ""}`);
}

main().catch(console.error);
