/**
 * 從舊網站 dcfilms.tv 抓每個作品的中文描述，
 * 然後更新 Notion 資料庫的 description_zh 欄位。
 *
 * 使用方法：
 *   node scripts/sync-descriptions.mjs              # 實際寫入（跳過已有值）
 *   node scripts/sync-descriptions.mjs --dry-run    # 只印出，不寫入 Notion
 *   node scripts/sync-descriptions.mjs --force      # 強制覆蓋已有描述
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
const FORCE = process.argv.includes("--force");

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

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 抓 <h4> 之後、第一個 <h2> 之前的所有 <p> 段落，合併為描述。
 * 若找不到 h4，則取頁面中第一個有意義的 <p>。
 */
function extractDescription(html) {
  // 找 <h4> 的位置
  const h4Match = html.match(/<h4[^>]*>/i);
  const h2Match = html.match(/<h2[^>]*>/i);

  let searchArea = html;

  if (h4Match) {
    const afterH4 = html.slice(html.indexOf(h4Match[0]) + h4Match[0].length);
    // 只取到第一個 <h2>（如果有的話）
    const h2Idx = afterH4.search(/<h2[^>]*>/i);
    searchArea = h2Idx >= 0 ? afterH4.slice(0, h2Idx) : afterH4;
  } else if (h2Match) {
    // 沒有 h4，取第一個 h2 之前的段落
    searchArea = html.slice(0, html.indexOf(h2Match[0]));
  }

  // 找所有 <p>...</p>
  const NAV_PATTERNS = /Previous Project|Next Project|Pages\s*About|米蘭視覺規劃/;
  const paragraphs = [...searchArea.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => stripHtml(m[1]))
    .filter((t) => t.length > 10 && !NAV_PATTERNS.test(t)); // 過濾空白、太短、導覽文字

  return paragraphs.join("\n\n");
}

// ── 抓舊網站所有作品描述 ──────────────────────────────
async function scrapeDescriptions() {
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
      const description = extractDescription(html);
      results[slug] = description || null;
      const preview = description ? description.slice(0, 50).replace(/\n/g, " ") + "…" : "❌ 無描述";
      console.log(`  ✓ ${slug}  「${preview}」`);
    } catch (e) {
      console.log(`  ✗ ${slug}  ${e.message}`);
      results[slug] = null;
    }
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
  console.log(DRY_RUN ? "=== DRY RUN ===" : `=== 開始同步描述${FORCE ? "（--force 覆蓋）" : ""} ===`);

  const [descriptions, notionPages] = await Promise.all([
    scrapeDescriptions(),
    getNotionProjects(),
  ]);

  let updated = 0;
  let skipped = 0;
  let noDesc = 0;

  for (const page of notionPages) {
    const p = page.properties;
    const slug = p["slug"]?.rich_text?.map((t) => t.plain_text).join("") ?? "";
    if (!slug) { skipped++; continue; }

    const oldSiteSlug = SLUG_MAP[slug] ?? slug;
    const newDesc = descriptions[oldSiteSlug];
    if (!newDesc) {
      console.log(`⚠️  "${slug}" 無法抓到描述`);
      noDesc++;
      continue;
    }

    const currentDesc = p["description_zh"]?.rich_text?.map((t) => t.plain_text).join("") ?? "";
    if (currentDesc && !FORCE) {
      console.log(`⏭  "${slug}" 已有描述，跳過（--force 可覆蓋）`);
      skipped++;
      continue;
    }

    console.log(`\n📝 ${slug}`);
    console.log(`   ${newDesc.slice(0, 80).replace(/\n/g, " ")}…`);

    if (!DRY_RUN) {
      // Notion rich_text 上限 2000 字元
      const content = newDesc.slice(0, 2000);
      await notion.pages.update({
        page_id: page.id,
        properties: {
          description_zh: {
            rich_text: [{ type: "text", text: { content } }],
          },
        },
      });
      await new Promise((r) => setTimeout(r, 300));
    }
    updated++;
  }

  console.log(`\n完成！更新 ${updated} 筆，跳過 ${skipped} 筆，無描述 ${noDesc} 筆${DRY_RUN ? "（DRY RUN 未實際寫入）" : ""}`);
}

main().catch(console.error);
