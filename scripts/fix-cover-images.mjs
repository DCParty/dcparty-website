/**
 * fix-cover-images.mjs
 *
 * 從舊網站 /projects/ 列表頁抓「每個作品的縮圖」
 * (列表頁裡每個 portfolio/slug/ 連結的前一張圖片即縮圖)
 * 上傳到 Cloudinary（overwrite=true 覆蓋錯誤圖片）
 * 再更新 Notion cover_image 欄位
 *
 * 執行：node scripts/fix-cover-images.mjs
 * 只修特定作品：node scripts/fix-cover-images.mjs darphin omron cosmeticphotography
 */

import https from "https";
import http from "http";
import { createHash } from "crypto";

// ── Config ─────────────────────────────────────────────
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_PROJECTS_DB = process.env.NOTION_PROJECTS_DB_ID;
const CLD_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLD_KEY = process.env.CLOUDINARY_API_KEY;
const CLD_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!NOTION_TOKEN || !NOTION_PROJECTS_DB || !CLD_CLOUD || !CLD_KEY || !CLD_SECRET) {
  console.error("Missing env vars. Make sure .env.local is loaded.");
  process.exit(1);
}

// Notion slug → 舊網站 slug 對應表
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

// ── Helpers ────────────────────────────────────────────
function fetchText(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location).then(resolve).catch(reject);
      }
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.request(url, options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

/** 從 /projects/ 列表頁抓「slug → 縮圖 URL」對照表 */
async function scrapeListingThumbnails() {
  console.log("🔍 Scraping https://dcfilms.tv/projects/ for thumbnails...");
  const html = await fetchText("https://dcfilms.tv/projects/");

  // 抓出所有 portfolio/slug/ 連結和 wp-content/uploads 圖片 URL
  const tokens = [
    ...(html.match(/portfolio\/[a-z0-9_-]+\//gi) || []),
    ...(html.match(/wp-content\/uploads\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)/gi) || []),
  ];

  // 重新用 HTML 順序提取（保持位置）
  const allMatches = [];
  const re = /(portfolio\/[a-z0-9_-]+\/)|(wp-content\/uploads\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif))/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    allMatches.push({ type: m[1] ? "slug" : "img", value: m[1] || m[2] });
  }

  // 過濾 logo/header 圖片（前兩個 img 通常是 logo）
  const SKIP_IMG = /logo|avatar|author|portrait-of/i;
  const filtered = allMatches.filter(t => !(t.type === "img" && SKIP_IMG.test(t.value)));

  // 建立對照表：縮圖是每個 slug 的「前一個 img」
  const map = {};
  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i].type === "slug") {
      // 往前找最近的 img
      for (let j = i - 1; j >= 0; j--) {
        if (filtered[j].type === "img") {
          const slug = filtered[i].value.replace(/^portfolio\/|\/$/g, "");
          map[slug] = "https://dcfilms.tv/" + filtered[j].value;
          break;
        }
      }
    }
  }

  console.log(`   Found thumbnails for ${Object.keys(map).length} slugs\n`);
  return map;
}

/** Upload image URL to Cloudinary (overwrite=true) */
async function uploadToCloudinary(imageUrl, publicId) {
  const safeId = publicId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "dcfilms";

  const paramStr = `folder=${folder}&overwrite=true&public_id=${safeId}&timestamp=${timestamp}`;
  const signature = createHash("sha1").update(paramStr + CLD_SECRET).digest("hex");

  const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);
  const fields = {
    file: imageUrl,
    folder,
    public_id: safeId,
    overwrite: "true",
    timestamp: String(timestamp),
    api_key: CLD_KEY,
    signature,
  };

  let body = "";
  for (const [k, v] of Object.entries(fields)) {
    body += `--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`;
  }
  body += `--${boundary}--\r\n`;

  const result = await fetchJson(`https://api.cloudinary.com/v1_1/${CLD_CLOUD}/image/upload`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": Buffer.byteLength(body),
    },
    body,
  });

  if (result.secure_url) return result.secure_url;
  if (result.error) throw new Error(result.error.message);
  throw new Error("Unknown Cloudinary response: " + JSON.stringify(result));
}

/** Update Notion page cover_image */
async function updateNotion(pageId, url) {
  return fetchJson(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(JSON.stringify({ properties: { cover_image: { url } } })),
    },
    body: JSON.stringify({ properties: { cover_image: { url } } }),
  });
}

/** Get all projects from Notion */
async function getNotionProjects() {
  const results = [];
  let cursor = undefined;
  do {
    const body = JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) });
    const res = await fetchJson("https://api.notion.com/v1/databases/" + NOTION_PROJECTS_DB + "/query", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
      body,
    });
    for (const page of (res.results || [])) {
      const p = page.properties || {};
      const slug = (p.slug?.rich_text?.[0]?.plain_text) || "";
      const title = (p.title?.title?.[0]?.plain_text) || "(no title)";
      const cover = p.cover_image?.url || "";
      if (slug) results.push({ id: page.id, slug, title, cover });
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

// ── Main ───────────────────────────────────────────────
async function main() {
  // 指定要修的 old-site slug（命令列參數），空則修全部
  const targetSlugs = new Set(process.argv.slice(2));

  const [thumbnailMap, projects] = await Promise.all([
    scrapeListingThumbnails(),
    (async () => {
      console.log("📋 Fetching Notion projects...");
      const p = await getNotionProjects();
      console.log(`   Found ${p.length} projects\n`);
      return p;
    })(),
  ]);

  let fixed = 0, skipped = 0, failed = 0;

  for (const project of projects) {
    const { id, slug: notionSlug, title, cover } = project;
    const oldSiteSlug = SLUG_MAP[notionSlug] ?? notionSlug;

    // 若有指定目標，只修這些
    if (targetSlugs.size > 0 && !targetSlugs.has(oldSiteSlug) && !targetSlugs.has(notionSlug)) {
      continue;
    }

    const thumbnailUrl = thumbnailMap[oldSiteSlug];
    if (!thumbnailUrl) {
      if (targetSlugs.has(oldSiteSlug) || targetSlugs.has(notionSlug)) {
        console.log(`❓ ${title} (${oldSiteSlug}) — not found on listing page`);
      }
      continue;
    }

    process.stdout.write(`🔄 ${title} (${oldSiteSlug})... `);

    try {
      const cldUrl = await uploadToCloudinary(thumbnailUrl, oldSiteSlug);
      await updateNotion(id, cldUrl);
      console.log(`✅ updated`);
      fixed++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      failed++;
    }

    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n✨ Done: ${fixed} fixed, ${skipped} skipped, ${failed} failed`);
}

main().catch(console.error);
