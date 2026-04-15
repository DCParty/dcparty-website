/**
 * 從舊網站匯入尚未在 Notion 的專案（published: false，供人工審核後上線）
 *
 * 使用方法：
 *   node scripts/import-missing-projects.mjs            # 實際建立
 *   node scripts/import-missing-projects.mjs --dry-run  # 只印出，不寫入
 */

import { Client } from "@notionhq/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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

const notion = new Client({ auth: NOTION_TOKEN });

// 舊網站有但 Notion 無對應的 slug（已排除有 SLUG_MAP 對應的那 11 個）
const MISSING_SLUGS = [
  "taobao",
  "cheersfood",
  "supportingteam",
  "2h-fitness",
  "iweecare",
  "woodywoody-band",
  "mrpv-solar",
  "vanmoof",
  "insurance",
  "pantane",
  "bmw2_activity",
  "mr-rich",
  "infocus-m350",
  "hompro",
  "ten_ten",
  "dyaco_mg",
  "o_life",
  "k-plus",
  "zenlet",
  "think",
  "infocus-w201",
];

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; DCFilmsBot/1.0)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

function extractTitle(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? stripHtml(m[1]) : "";
}

function extractCategory(html) {
  const m = html.match(/<h4[^>]*>([\s\S]*?)<\/h4>/i);
  return m ? stripHtml(m[1]) : "";
}

function extractVimeoId(html) {
  const m = html.match(/player\.vimeo\.com\/video\/(\d+)/);
  return m ? m[1] : null;
}

function extractMainImage(html) {
  const all = [
    ...[...html.matchAll(/u:https:\/\/(?:www\.)?dcfilms\.tv\/(wp-content\/uploads\/[^"'&\s]+\.(?:jpg|jpeg|png|webp))/gi)].map((m) => m[1]),
    ...[...html.matchAll(/src="https:\/\/(?:www\.)?dcfilms\.tv\/(wp-content\/uploads\/[^"']+\.(?:jpg|jpeg|png|webp))"/gi)].map((m) => m[1]),
  ];
  const SKIP = /logo|avatar|portrait|author|人像|拷貝|-\d+x\d+\./i;
  const candidates = [...new Set(all)].filter((p) => !SKIP.test(p));
  if (!candidates.length) return null;
  const wide = candidates.find((p) => /\/1920?\d{2,}/.test(p));
  return `https://dcfilms.tv/${wide ?? candidates[0]}`;
}

function extractDescription(html) {
  const h4Match = html.match(/<h4[^>]*>/i);
  const h2Match = html.match(/<h2[^>]*>/i);
  let searchArea = html;

  if (h4Match) {
    const afterH4 = html.slice(html.indexOf(h4Match[0]) + h4Match[0].length);
    const h2Idx = afterH4.search(/<h2[^>]*>/i);
    searchArea = h2Idx >= 0 ? afterH4.slice(0, h2Idx) : afterH4;
  } else if (h2Match) {
    searchArea = html.slice(0, html.indexOf(h2Match[0]));
  }

  const NAV_PATTERNS = /Previous Project|Next Project|Pages\s*About|米蘭視覺規劃/;
  const paragraphs = [...searchArea.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => stripHtml(m[1]))
    .filter((t) => t.length > 10 && !NAV_PATTERNS.test(t));

  return paragraphs.join("\n\n");
}

async function getExistingNotionSlugs() {
  const slugs = new Set();
  let cursor;
  do {
    const res = await notion.databases.query({
      database_id: NOTION_PROJECTS_DB_ID,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    for (const page of res.results) {
      const slug = page.properties["slug"]?.rich_text?.map((t) => t.plain_text).join("") ?? "";
      if (slug) slugs.add(slug);
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return slugs;
}

async function main() {
  console.log(DRY_RUN ? "=== DRY RUN ===" : "=== 匯入缺失專案 ===");
  console.log(`目標：${MISSING_SLUGS.length} 個 slug\n`);

  const existingSlugs = await getExistingNotionSlugs();

  let created = 0, skipped = 0, failed = 0;

  for (const slug of MISSING_SLUGS) {
    if (existingSlugs.has(slug)) {
      console.log(`⏭  "${slug}" 已存在於 Notion，跳過`);
      skipped++;
      continue;
    }

    try {
      const html = await fetchHtml(`https://dcfilms.tv/portfolio/${slug}/`);
      await new Promise((r) => setTimeout(r, 300));

      const title = extractTitle(html) || slug;
      const category = extractCategory(html);
      const vimeoId = extractVimeoId(html);
      const image = extractMainImage(html);
      const desc = extractDescription(html);

      console.log(`\n📦 ${slug}`);
      console.log(`   title: ${title}`);
      console.log(`   category: ${category || "（無）"}`);
      console.log(`   vimeo: ${vimeoId ?? "—"}  img: ${image ? "✅" : "❌"}`);
      console.log(`   desc: ${desc ? desc.slice(0, 60).replace(/\n/g, " ") + "…" : "（無）"}`);

      if (!DRY_RUN) {
        const properties = {
          title: { title: [{ text: { content: title } }] },
          slug: { rich_text: [{ text: { content: slug } }] },
          published: { checkbox: false },
        };

        if (category) {
          properties["category"] = { multi_select: [{ name: category }] };
        }
        if (image) {
          properties["cover_image"] = { url: image };
        }
        if (vimeoId) {
          properties["vimeo_url"] = { url: `https://vimeo.com/${vimeoId}` };
        }
        if (desc) {
          properties["description_zh"] = {
            rich_text: [{ type: "text", text: { content: desc.slice(0, 2000) } }],
          };
        }

        await notion.pages.create({
          parent: { database_id: NOTION_PROJECTS_DB_ID },
          properties,
        });
        await new Promise((r) => setTimeout(r, 400));
        created++;
      } else {
        created++;
      }
    } catch (e) {
      console.log(`  ❌ ${slug}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n完成！建立 ${created} 筆，跳過 ${skipped} 筆，失敗 ${failed} 筆${DRY_RUN ? "（DRY RUN 未實際寫入）" : ""}`);
  if (!DRY_RUN && created > 0) {
    console.log("\n⚠️  新建的專案 published=false，請在 Notion 審核後手動開啟上線。");
  }
}

main().catch(console.error);
