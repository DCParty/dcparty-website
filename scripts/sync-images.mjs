/**
 * 一次性遷移腳本：
 * 1. 從 Notion 讀取所有作品 slug
 * 2. 從 dcfilms.tv 舊站爬取每個作品的封面圖 URL
 * 3. 上傳到 Cloudinary（去重）
 * 4. 把 Cloudinary URL 回寫到 Notion cover_image 欄位
 *
 * 執行：node scripts/sync-images.mjs
 */

import https from "https";
import http from "http";

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

// ── Helpers ────────────────────────────────────────────
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

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location).then(resolve).catch(reject);
      }
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

/** Scrape first large image from a dcfilms.tv page */
async function scrapeImage(slug) {
  const urls = [
    `https://dcfilms.tv/works/${slug}/`,
    `https://dcfilms.tv/${slug}/`,
  ];
  for (const url of urls) {
    try {
      const html = await fetchText(url);
      const matches = html.match(/https:\/\/dcfilms\.tv\/wp-content\/uploads\/[^"' )>]+\.(?:jpg|jpeg|png)/gi);
      if (matches && matches.length > 0) {
        // Prefer larger images (avoid small thumbnails)
        const sorted = matches.sort((a, b) => b.length - a.length);
        return sorted[0];
      }
    } catch { /* try next */ }
  }
  return null;
}

/** Upload image URL to Cloudinary via upload API */
async function uploadToCloudinary(imageUrl, publicId) {
  const safeId = publicId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);

  // Create signed upload params
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "dcfilms";

  // Cloudinary signature: SHA1(sorted_params_string + api_secret)
  const { createHash } = await import("crypto");
  const paramStr = `folder=${folder}&overwrite=false&public_id=${safeId}&timestamp=${timestamp}`;
  const signature = createHash("sha1").update(paramStr + CLD_SECRET).digest("hex");

  const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);
  const fields = {
    file: imageUrl,
    folder,
    public_id: safeId,
    overwrite: "false",
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
  if (result.error) {
    // Already exists → construct URL
    if (result.error.message?.includes("already exists")) {
      return `https://res.cloudinary.com/${CLD_CLOUD}/image/upload/${folder}/${safeId}`;
    }
    throw new Error(result.error.message);
  }
  throw new Error("Unknown Cloudinary response: " + JSON.stringify(result));
}

/** Update Notion page cover_image URL */
async function updateNotion(pageId, url) {
  return fetchJson(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(
        JSON.stringify({ properties: { cover_image: { url } } })
      ),
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
      const slugArr = (p.slug || {}).rich_text || [];
      const slug = slugArr[0]?.plain_text || "";
      const titleArr = (p.title || {}).title || [];
      const title = titleArr[0]?.plain_text || "(no title)";
      const cover = (p.cover_image || {}).url || "";
      if (slug) results.push({ id: page.id, slug, title, cover });
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

// ── Main ───────────────────────────────────────────────
async function main() {
  console.log("📋 Fetching Notion projects...");
  const projects = await getNotionProjects();
  console.log(`   Found ${projects.length} projects\n`);

  let synced = 0, skipped = 0, failed = 0;

  for (const project of projects) {
    const { id, slug, title, cover } = project;

    // Skip if already Cloudinary URL
    if (cover && cover.includes("res.cloudinary.com")) {
      console.log(`⏭  ${title} — already Cloudinary`);
      skipped++;
      continue;
    }

    process.stdout.write(`🔍 ${title} (${slug})... `);

    // Scrape image from old site
    const imgUrl = await scrapeImage(slug);
    if (!imgUrl) {
      console.log("❌ no image found on old site");
      failed++;
      continue;
    }
    process.stdout.write(`found → uploading... `);

    try {
      const cldUrl = await uploadToCloudinary(imgUrl, slug);
      await updateNotion(id, cldUrl);
      console.log(`✅ ${cldUrl.split("/").pop()}`);
      synced++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      failed++;
    }

    // Rate limit: 2 req/sec to be safe
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n✨ Done: ${synced} synced, ${skipped} skipped, ${failed} failed`);
}

main().catch(console.error);
