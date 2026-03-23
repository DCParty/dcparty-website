import { Client } from "@notionhq/client";
import { slugify, slugifyWithId, extractIdPrefix } from "./slugify";

const apiKey = () => process.env.NOTION_API_KEY;

/** 是否為「找不到資料庫 / 未分享給 Integration」錯誤 */
function isNotionNotFound(err) {
  const code = err?.code ?? err?.body?.code;
  const msg = err?.message ?? "";
  return code === "object_not_found" || msg.includes("Could not find database") || msg.includes("shared with your integration");
}

let _notionShareWarned = false;
function warnNotionShareOnce() {
  if (_notionShareWarned) return;
  _notionShareWarned = true;
  console.warn(
    "[Notion] 部分資料庫找不到或尚未分享給 Integration。請在 Notion 中對每個資料庫：開啟頁面 → 右上角 ⋯ → Connections → 選擇你的 Integration。"
  );
}

function rt(prop) {
  if (!prop?.rich_text?.length) return "";
  return prop.rich_text.map((t) => t.plain_text).join("");
}
function titleText(prop) {
  if (!prop?.title?.length) return "";
  return prop.title.map((t) => t.plain_text).join("");
}
function fileUrl(prop) {
  if (!prop) return "";
  if (prop.url) return prop.url;
  if (prop.files?.length) {
    const first = prop.files[0];
    return first?.file?.url ?? first?.external?.url ?? "";
  }
  return "";
}

/**
 * A = 全站設定（取第一筆）
 */
export async function getSiteSettings() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID_A;
  if (!key || !databaseId) return null;
  const notion = new Client({ auth: key });
  try {
    const { results } = await notion.databases.query({ database_id: databaseId, page_size: 1 });
    const page = results[0];
    if (!page?.properties) return null;
    const p = page.properties;
    return {
      brandName: titleText(p["品牌名稱"]) || "DCPARTY",
      logoUrl: fileUrl(p["品牌Logo"] ?? p["Logo"]) || "",
      brandColor: rt(p["品牌主色"]) || "#E23D28",
      backgroundColor: rt(p["背景色"]) || "#0A0A0A",
      navServices: rt(p["Nav_服務文字"]) || "我們的服務",
      navWork: rt(p["Nav_作品文字"]) || "精選案例",
      navPricing: rt(p["Nav_方案文字"]) || "合作方案",
      navCta: rt(p["Nav_CTA文字"]) || "線上諮詢",
      heroBadge: rt(p["Hero_Badge"]) || "AI 賦能的高效創意工作流",
      heroTitleLine1: rt(p["Hero_標題_上行"]) || "用技術與美學，",
      heroTitleLine2: rt(p["Hero_標題_下行"]) || "為品牌發起一場",
      heroTitleHighlight: rt(p["Hero_標題_強調"]) || "數位狂歡",
      heroDesc: rt(p["Hero_內文"]) || "我們是 DCParty，專注於廣告影音、視覺設計與軟體開發。拒絕模板化生產，我們結合最新 AI 技術，為您打造細膩且具備影響力的數位資產。",
      heroCtaPrimary: rt(p["Hero_CTA_主按鈕文字"]) || "開始創意合作",
      heroCtaSecondary: rt(p["Hero_CTA_副按鈕文字"]) || "瀏覽精選作品",
      contactEmail: p["聯絡_Email"]?.email || rt(p["聯絡_Email"]) || "jeremy@dcparty.co",
      contactPhone: p["聯絡_電話"]?.phone_number || rt(p["聯絡_電話"]) || "0935503966",
      contactModalLabel: rt(p["聯絡_Modal小標"]) || "Let's Talk",
      contactModalTitle: rt(p["聯絡_Modal標題"]) || "開啟您的專屬創意對話",
      contactModalDesc: rt(p["聯絡_Modal描述"]) || "感謝您對 DCParty 的關注。無論是希望啟動品牌常駐合作，或是客製化大型專案，我們都已經準備好傾聽您的想法。",
      footerTagline: rt(p["Footer_品牌宣言"]) || "技術為底，美學為魂。我們是您的全方位數位創意夥伴。",
      footerCopyright: rt(p["Footer_版權文字"]) || "ALL RIGHTS RESERVED.",
    };
  } catch (err) {
    if (isNotionNotFound(err)) { warnNotionShareOnce(); return null; }
    console.error("[Notion] getSiteSettings 錯誤:", err.message);
    return null;
  }
}

/**
 * B = 服務（發布狀態=true，依排序）
 */
export async function getServices() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID_B;
  if (!key || !databaseId) return [];
  const notion = new Client({ auth: key });
  try {
    const { results } = await notion.databases.query({
      database_id: databaseId,
      filter: { property: "發布狀態", checkbox: { equals: true } },
      sorts: [{ property: "排序", direction: "ascending" }],
    });
    return results.map((page) => {
      const p = page.properties;
      const tag = rt(p["英文 Tag"]);
      return {
        id: page.id,
        title: titleText(p["服務名稱"]),
        desc: rt(p["服務描述"]),
        tag,
        slug: tag ? slugify(tag) : page.id,
        icon: p["圖示"]?.select?.name || "Film",
      };
    });
  } catch (err) {
    if (isNotionNotFound(err)) { warnNotionShareOnce(); return []; }
    console.error("[Notion] getServices 錯誤:", err.message);
    return [];
  }
}

/**
 * 取得單一服務（B 資料庫，依 page id）
 */
export async function getServiceById(pageId) {
  const key = apiKey();
  if (!key || !pageId) return null;
  const notion = new Client({ auth: key });
  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    if (!page?.properties) return null;
    const p = page.properties;
    return {
      id: page.id,
      title: titleText(p["服務名稱"]) || "未命名服務",
      desc: rt(p["服務描述"]),
      tag: rt(p["英文 Tag"]),
      icon: p["圖示"]?.select?.name || "Film",
      detail: rt(p["詳情"] ?? p["詳細描述"]),
    };
  } catch (err) {
    if (isNotionNotFound(err)) return null;
    console.error("[Notion] getServiceById 錯誤:", err.message);
    return null;
  }
}

/**
 * C = 作品集（發布狀態=true，依排序）
 */
export async function getPublishedWorks() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID ?? process.env.NOTION_DATABASE_ID_C;
  if (!key || !databaseId) {
    console.warn("[Notion] 缺少 NOTION_API_KEY 或 NOTION_DATABASE_ID，將回傳空陣列。");
    return [];
  }
  const notion = new Client({ auth: key });
  try {
    const { results } = await notion.databases.query({
      database_id: databaseId,
      filter: { property: "發布狀態", checkbox: { equals: true } },
      sorts: [{ property: "排序", direction: "ascending" }],
    });
    return results.map((page) => {
      const p = page.properties;
      const title = titleText(p["作品名稱"]) || "未命名作品";
      return {
        id: page.id,
        title,
        slug: slugifyWithId(title, page.id),
        category: p["作品分類"]?.select?.name || "",
        image: fileUrl(p["封面圖片"]) || undefined,
        url: p["作品連結"]?.url || undefined,
      };
    });
  } catch (err) {
    if (isNotionNotFound(err)) { warnNotionShareOnce(); return []; }
    console.error("[Notion] getPublishedWorks 錯誤:", err.message);
    return [];
  }
}

/**
 * 取得單一作品（C 資料庫，用於案例分析頁）
 */
export async function getWorkById(pageId) {
  const key = apiKey();
  if (!key || !pageId) return null;
  const notion = new Client({ auth: key });
  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    if (!page?.properties) return null;
    const p = page.properties;
    const title = titleText(p["作品名稱"]) || "未命名作品";
    return {
      id: page.id,
      title,
      category: p["作品分類"]?.select?.name || "",
      image: fileUrl(p["封面圖片"]) || undefined,
      url: p["作品連結"]?.url || undefined,
      challenge: rt(p["客戶痛點"]),
      solution: rt(p["創意解法"]),
      result: rt(p["最終成效"]),
    };
  } catch (err) {
    if (isNotionNotFound(err)) return null;
    console.error("[Notion] getWorkById 錯誤:", err.message);
    return null;
  }
}

/**
 * D = 定價方案（發布狀態=true，依排序）
 */
export async function getPricingPlans() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID_D;
  if (!key || !databaseId) return [];
  const notion = new Client({ auth: key });
  try {
    const { results } = await notion.databases.query({
      database_id: databaseId,
      filter: { property: "發布狀態", checkbox: { equals: true } },
      sorts: [{ property: "排序", direction: "ascending" }],
    });
    return results.map((page) => {
      const p = page.properties;
      let features = [];
      const f = p["功能列表"];
      if (f?.multi_select?.length) features = f.multi_select.map((s) => s.name);
      else if (f?.rich_text?.length) {
        const text = rt(f);
        if (text) features = text.split(/\n/).map((s) => s.trim()).filter(Boolean);
      }
      return {
        name: titleText(p["方案名稱"]),
        price: rt(p["價格"]),
        priceUnit: rt(p["計價單位"]) || "月",
        desc: rt(p["方案描述"]),
        features,
        btn: rt(p["按鈕文字"]) || "了解方案",
        popular: p["推薦方案"]?.checkbox === true,
      };
    });
  } catch (err) {
    if (isNotionNotFound(err)) { warnNotionShareOnce(); return []; }
    console.error("[Notion] getPricingPlans 錯誤:", err.message);
    return [];
  }
}

/**
 * K = 常見問題（發布狀態=true，依排序）
 */
export async function getFAQs() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID_K;
  if (!key || !databaseId) return [];
  const notion = new Client({ auth: key });
  try {
    const { results } = await notion.databases.query({
      database_id: databaseId,
      filter: { property: "發布狀態", checkbox: { equals: true } },
      sorts: [{ property: "排序", direction: "ascending" }],
    });
    return results.map((page) => {
      const p = page.properties;
      return {
        id: page.id,
        question: titleText(p["問題"]),
        answer: rt(p["答案"]),
      };
    }).filter((faq) => faq.question);
  } catch (err) {
    if (isNotionNotFound(err)) { warnNotionShareOnce(); return []; }
    console.error("[Notion] getFAQs 錯誤:", err.message);
    return [];
  }
}

/**
 * E = 社群連結（發布狀態=true，依排序）
 */
export async function getSocialLinks() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID_E;
  if (!key || !databaseId) return [];
  const notion = new Client({ auth: key });
  try {
    const { results } = await notion.databases.query({
      database_id: databaseId,
      filter: { property: "發布狀態", checkbox: { equals: true } },
      sorts: [{ property: "排序", direction: "ascending" }],
    });
    return results.map((page) => {
      const p = page.properties;
      return {
        name: titleText(p["名稱"]),
        url: p["連結"]?.url || "",
      };
    });
  } catch (err) {
    if (isNotionNotFound(err)) { warnNotionShareOnce(); return []; }
    console.error("[Notion] getSocialLinks 錯誤:", err.message);
    return [];
  }
}

/**
 * F = 導覽連結（發布狀態=true，依排序）
 */
export async function getNavLinks() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID_F;
  if (!key || !databaseId) return [];
  const notion = new Client({ auth: key });
  try {
    const { results } = await notion.databases.query({
      database_id: databaseId,
      filter: { property: "發布狀態", checkbox: { equals: true } },
      sorts: [{ property: "排序", direction: "ascending" }],
    });
    return results.map((page) => {
      const p = page.properties;
      const href = p["href"]?.url || rt(p["href"]) || "#";
      return {
        name: titleText(p["名稱"]),
        href,
      };
    });
  } catch (err) {
    if (isNotionNotFound(err)) { warnNotionShareOnce(); return []; }
    console.error("[Notion] getNavLinks 錯誤:", err.message);
    return [];
  }
}

/**
 * I = 客戶評價（發布狀態=true，依排序）
 */
export async function getTestimonials() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID_I;
  if (!key || !databaseId) return [];
  const notion = new Client({ auth: key });
  try {
    const { results } = await notion.databases.query({
      database_id: databaseId,
      filter: { property: "發布狀態", checkbox: { equals: true } },
      sorts: [{ property: "排序", direction: "ascending" }],
    });
    return results.map((page) => {
      const p = page.properties;
      return {
        id: page.id,
        name: titleText(p["客戶名稱"]),
        quote: rt(p["評價內容"]),
        role: rt(p["職稱或公司"]),
        avatar: fileUrl(p["頭像"]) || undefined,
      };
    });
  } catch (err) {
    if (isNotionNotFound(err)) { warnNotionShareOnce(); return []; }
    console.error("[Notion] getTestimonials 錯誤:", err.message);
    return [];
  }
}

/**
 * J = 合作品牌（發布狀態=true，依排序）
 */
export async function getPartnerLogos() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID_J;
  if (!key || !databaseId) return [];
  const notion = new Client({ auth: key });
  try {
    const { results } = await notion.databases.query({
      database_id: databaseId,
      filter: { property: "發布狀態", checkbox: { equals: true } },
      sorts: [{ property: "排序", direction: "ascending" }],
    });
    return results.map((page) => {
      const p = page.properties;
      return {
        id: page.id,
        name: titleText(p["品牌名稱"]),
        logo: fileUrl(p["Logo"]) || undefined,
      };
    });
  } catch (err) {
    if (isNotionNotFound(err)) { warnNotionShareOnce(); return []; }
    console.error("[Notion] getPartnerLogos 錯誤:", err.message);
    return [];
  }
}

/**
 * H = 部落格（發布狀態=true，依最後編輯時間）
 */
export async function getBlogPosts() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID_H;
  if (!key || !databaseId) return [];
  const notion = new Client({ auth: key });
  try {
    const { results } = await notion.databases.query({
      database_id: databaseId,
      filter: { property: "發布狀態", checkbox: { equals: true } },
      sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
    });
    return results.map((page) => {
      const p = page.properties;
      const title = titleText(p["標題"]) || "未命名文章";
      return {
        id: page.id,
        title,
        slug: slugifyWithId(title, page.id),
        excerpt: rt(p["摘要"]),
        category: p["分類"]?.select?.name || "",
        coverImage: fileUrl(p["封面圖"]) || undefined,
      };
    });
  } catch (err) {
    if (isNotionNotFound(err)) { warnNotionShareOnce(); return []; }
    console.error("[Notion] getBlogPosts 錯誤:", err.message);
    return [];
  }
}

/**
 * 取得單篇部落格文章（含頁面內文 blocks）
 */
export async function getBlogPostById(pageId) {
  const key = apiKey();
  if (!key || !pageId) return null;
  const notion = new Client({ auth: key });
  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    if (!page?.properties) return null;
    const p = page.properties;
    const title = titleText(p["標題"]) || "未命名文章";
    const post = {
      id: page.id,
      title,
      excerpt: rt(p["摘要"]),
      category: p["分類"]?.select?.name || "",
      coverImage: fileUrl(p["封面圖"]) || undefined,
    };
    let blocks = [];
    try {
      const { results } = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });
      blocks = results || [];
    } catch (blockErr) {
      console.error("[Notion] getBlogPostById blocks 錯誤:", blockErr?.message);
    }
    return { ...post, blocks };
  } catch (err) {
    if (isNotionNotFound(err)) return null;
    console.error("[Notion] getBlogPostById 錯誤:", err.message);
    return null;
  }
}

// ──────────────────────────────────────
// Slug-based lookups（語意化 URL 支援）
// ──────────────────────────────────────

export async function getServiceBySlug(slug) {
  const services = await getServices();
  const match = services.find((s) => s.slug === slug);
  if (!match) return null;
  return getServiceById(match.id);
}

export async function getWorkBySlug(slug) {
  const works = await getPublishedWorks();
  const prefix = extractIdPrefix(slug);
  const match = works.find((w) => w.id.replace(/-/g, "").slice(0, 8) === prefix);
  if (!match) return null;
  return getWorkById(match.id);
}

export async function getBlogPostBySlug(slug) {
  const posts = await getBlogPosts();
  const prefix = extractIdPrefix(slug);
  const match = posts.find((p) => p.id.replace(/-/g, "").slice(0, 8) === prefix);
  if (!match) return null;
  return getBlogPostById(match.id);
}

export async function getAllServiceSlugs() {
  const services = await getServices();
  return services.map((s) => s.slug);
}

export async function getAllWorkSlugs() {
  const works = await getPublishedWorks();
  return works.map((w) => w.slug);
}

export async function getAllBlogSlugs() {
  const posts = await getBlogPosts();
  return posts.map((p) => p.slug);
}
