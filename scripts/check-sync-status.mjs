/**
 * 診斷腳本：確認每個 Notion 專案是否對應到舊網站的圖片、Vimeo、描述
 *
 * 使用方法：
 *   node scripts/check-sync-status.mjs
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
const notion = new Client({ auth: NOTION_TOKEN });

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; DCFilmsBot/1.0)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function getOldSiteSlugs() {
  const html = await fetchHtml("https://dcfilms.tv/projects/");
  return [...new Set(
    [...html.matchAll(/href="https?:\/\/dcfilms\.tv\/portfolio\/([^"\/]+)\//g)]
      .map((m) => m[1])
  )];
}

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

function rt(prop) {
  return prop?.rich_text?.map((t) => t.plain_text).join("") ?? "";
}

async function main() {
  console.log("=== DC Films 專案對照診斷 ===\n");

  const [oldSlugs, notionPages] = await Promise.all([
    getOldSiteSlugs(),
    getNotionProjects(),
  ]);

  const oldSlugSet = new Set(oldSlugs);
  console.log(`舊網站共 ${oldSlugs.length} 個作品`);
  console.log(`Notion 共 ${notionPages.length} 筆\n`);

  const rows = [];
  const matchedOldSlugs = new Set();

  for (const page of notionPages) {
    const p = page.properties;
    const title = p["title"]?.title?.map((t) => t.plain_text).join("") ?? "(無標題)";
    const slug = rt(p["slug"]);
    const published = p["published"]?.checkbox ?? false;
    const cover = p["cover_image"]?.url ?? "";
    const vimeo = p["vimeo_url"]?.url ?? "";
    const descZh = rt(p["description_zh"]);

    const hasOldMatch = slug && oldSlugSet.has(slug);
    if (hasOldMatch) matchedOldSlugs.add(slug);

    rows.push({
      title,
      slug: slug || "(無slug)",
      published,
      cover: !!cover,
      vimeo: !!vimeo,
      descZh: !!descZh,
      hasOldMatch,
    });
  }

  // 排序：無對應的排前面，然後依 slug
  rows.sort((a, b) => {
    if (!a.hasOldMatch && b.hasOldMatch) return -1;
    if (a.hasOldMatch && !b.hasOldMatch) return 1;
    return a.slug.localeCompare(b.slug);
  });

  // 輸出表格
  const COL = { slug: 32, title: 24, cover: 6, vimeo: 6, desc: 6, pub: 5, old: 6 };
  const header = [
    "Notion Slug".padEnd(COL.slug),
    "標題".padEnd(COL.title),
    "封面".padEnd(COL.cover),
    "Vimeo".padEnd(COL.vimeo),
    "描述".padEnd(COL.desc),
    "上線".padEnd(COL.pub),
    "舊站".padEnd(COL.old),
  ].join("| ");
  const divider = "-".repeat(header.length);

  console.log(header);
  console.log(divider);

  let totalOk = 0, totalPartial = 0, totalNoMatch = 0;

  for (const r of rows) {
    const c = r.cover ? "✅" : "❌";
    const v = r.vimeo ? "✅" : "❌";
    const d = r.descZh ? "✅" : "❌";
    const p = r.published ? "✅" : "  ";
    const o = r.hasOldMatch ? "✅" : "❌";

    const allGood = r.cover && r.vimeo && r.descZh && r.hasOldMatch;
    const anyBad = !r.cover || !r.vimeo || !r.descZh || !r.hasOldMatch;

    if (allGood) totalOk++;
    else if (!r.hasOldMatch) totalNoMatch++;
    else totalPartial++;

    const slugDisplay = r.slug.slice(0, COL.slug - 1).padEnd(COL.slug);
    const titleDisplay = r.title.slice(0, COL.title - 1).padEnd(COL.title);

    console.log([
      slugDisplay,
      titleDisplay,
      c.padEnd(COL.cover),
      v.padEnd(COL.vimeo),
      d.padEnd(COL.desc),
      p.padEnd(COL.pub),
      o.padEnd(COL.old),
    ].join("| "));
  }

  console.log(divider);
  console.log(`\n✅ 完整 ${totalOk} 筆 | ⚠️  部分缺失 ${totalPartial} 筆 | ❌ 無舊網站對應 ${totalNoMatch} 筆`);

  // 舊網站有但 Notion 無對應的 slug
  const unmatched = oldSlugs.filter((s) => !matchedOldSlugs.has(s));
  if (unmatched.length > 0) {
    console.log(`\n=== 舊網站有但 Notion 無對應的 slug（共 ${unmatched.length} 個）===`);
    unmatched.forEach((s) => console.log(`  - ${s}`));
  } else {
    console.log("\n舊網站所有 slug 都已在 Notion 找到對應。");
  }
}

main().catch(console.error);
