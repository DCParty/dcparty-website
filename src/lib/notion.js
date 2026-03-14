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
    "[Notion] 部分資料庫找不到或尚未分享給 Integration。請在 Notion 中對每個資料庫：開啟頁面 → 右上角 ⋯ → Connections → 選擇你的 Integration。詳見 NOTION_SETUP.md"
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

/** 從 databases.retrieve() 取得 data_source_id（v5 SDK 必要步驟） */
async function getDataSourceId(notion, databaseId) {
  const db = await notion.databases.retrieve({ database_id: databaseId });
  return db?.data_sources?.[0]?.id ?? null;
}

/** 從 dataSources.retrieve() 取得欄位定義（以欄位名稱為 key） */
async function getSchemaProps(notion, dataSourceId) {
  const ds = await notion.dataSources.retrieve({ data_source_id: dataSourceId });
  return ds?.properties && typeof ds.properties === "object" ? ds.properties : {};
}

/**
 * A = 全站設定（取第一筆）
 * 欄位：品牌名稱, 品牌Logo(Files & media 或 URL), 品牌主色, 背景色, Nav_服務文字, Nav_作品文字, Nav_方案文字, Nav_CTA文字,
 * Hero_Badge, Hero_標題_上行, Hero_標題_下行, Hero_標題_強調, Hero_內文, Hero_CTA_主按鈕文字, Hero_CTA_副按鈕文字,
 * 聯絡_Email, 聯絡_電話, 聯絡_Modal小標, 聯絡_Modal標題, 聯絡_Modal描述, Footer_品牌宣言, Footer_版權文字
 */
export async function getSiteSettings() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID_A;
  if (!key || !databaseId) return null;
  const notion = new Client({ auth: key });
  try {
    const dataSourceId = await getDataSourceId(notion, databaseId);
    if (!dataSourceId) {
      console.warn("[Notion] getSiteSettings: 找不到 data_source_id，使用預設值。");
      return null;
    }
    const props = await getSchemaProps(notion, dataSourceId);
    if (Object.keys(props).length === 0) {
      console.warn(
        "[Notion] getSiteSettings: 資料庫 A 無欄位定義，使用預設值。若為新建資料庫，請在 Notion 中為該資料庫新增欄位（如 品牌名稱、品牌主色、Hero_Badge 等），見 NOTION_SETUP.md。"
      );
    }
    const nameToId = {};
    for (const [name, prop] of Object.entries(props)) {
      if (prop?.name) nameToId[prop.name] = name;
    }
    const { results } = await notion.dataSources.query({ data_source_id: dataSourceId, page_size: 1 });
    const page = results[0];
    if (!page?.properties) return null;
    const p = page.properties;
    const get = (name) => {
      const id = nameToId[name];
      if (!id || !p || !p[id]) return "";
      const v = p[id];
      if (v.title) return titleText(v);
      if (v.rich_text) return rt(v);
      if (v.url) return v.url || "";
      if (v.email) return v.email || "";
      if (v.phone_number) return v.phone_number || "";
      if (v.files?.length) {
        const first = v.files[0];
        return first?.file?.url ?? first?.external?.url ?? "";
      }
      return "";
    };
    return {
      brandName: get("品牌名稱") || "DCPARTY",
      logoUrl: get("品牌Logo") || get("Logo") || "",
      brandColor: get("品牌主色") || "#E23D28",
      backgroundColor: get("背景色") || "#0A0A0A",
      navServices: get("Nav_服務文字") || "我們的服務",
      navWork: get("Nav_作品文字") || "精選案例",
      navPricing: get("Nav_方案文字") || "合作方案",
      navCta: get("Nav_CTA文字") || "線上諮詢",
      heroBadge: get("Hero_Badge") || "AI 賦能的高效創意工作流",
      heroTitleLine1: get("Hero_標題_上行") || "用技術與美學，",
      heroTitleLine2: get("Hero_標題_下行") || "為品牌發起一場",
      heroTitleHighlight: get("Hero_標題_強調") || "數位狂歡",
      heroDesc: get("Hero_內文") || "我們是 DCParty，專注於廣告影音、視覺設計與軟體開發。拒絕模板化生產，我們結合最新 AI 技術，為您打造細膩且具備影響力的數位資產。",
      heroCtaPrimary: get("Hero_CTA_主按鈕文字") || "開始創意合作",
      heroCtaSecondary: get("Hero_CTA_副按鈕文字") || "瀏覽精選作品",
      contactEmail: get("聯絡_Email") || "jeremy@dcparty.co",
      contactPhone: get("聯絡_電話") || "0935503966",
      contactModalLabel: get("聯絡_Modal小標") || "Let's Talk",
      contactModalTitle: get("聯絡_Modal標題") || "開啟您的專屬創意對話",
      contactModalDesc: get("聯絡_Modal描述") || "感謝您對 DCParty 的關注。無論是希望啟動品牌常駐合作，或是客製化大型專案，我們都已經準備好傾聽您的想法。",
      footerTagline: get("Footer_品牌宣言") || "技術為底，美學為魂。我們是您的全方位數位創意夥伴。",
      footerCopyright: get("Footer_版權文字") || "ALL RIGHTS RESERVED.",
    };
  } catch (err) {
    if (isNotionNotFound(err)) {
      warnNotionShareOnce();
      return null;
    }
    console.error("[Notion] getSiteSettings 錯誤:", err.message);
    return null;
  }
}

/**
 * B = 服務（發布狀態=true，依排序）
 * 欄位：服務名稱(Title), 服務描述, 英文 Tag, 圖示(Select), 排序(Number), 發布狀態(Checkbox)
 */
export async function getServices() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID_B;
  if (!key || !databaseId) return [];
  const notion = new Client({ auth: key });
  try {
    const dataSourceId = await getDataSourceId(notion, databaseId);
    if (!dataSourceId) return [];
    const props = await getSchemaProps(notion, dataSourceId);
    const nameToId = {};
    for (const [name, prop] of Object.entries(props)) {
      if (prop?.name) nameToId[prop.name] = name;
    }
    const propPublished = nameToId["發布狀態"];
    const propTitle = nameToId["服務名稱"];
    const propDesc = nameToId["服務描述"];
    const propTag = nameToId["英文 Tag"];
    const propIcon = nameToId["圖示"];
    const propSort = nameToId["排序"];
    if (!propPublished) return [];
    const { results } = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: propPublished, checkbox: { equals: true } },
      sorts: propSort ? [{ property: propSort, direction: "ascending" }] : [],
    });
    return results.map((page) => {
      const p = page.properties;
      const tag = propTag ? rt(p[propTag]) : "";
      return {
        id: page.id,
        title: propTitle ? titleText(p[propTitle]) : "",
        desc: propDesc ? rt(p[propDesc]) : "",
        tag,
        slug: tag ? slugify(tag) : page.id,
        icon: propIcon && p[propIcon]?.select?.name ? p[propIcon].select.name : "Film",
      };
    });
  } catch (err) {
    if (isNotionNotFound(err)) {
      warnNotionShareOnce();
      return [];
    }
    console.error("[Notion] getServices 錯誤:", err.message);
    return [];
  }
}

/**
 * 取得單一服務（B 資料庫，依 page id）
 * 欄位同 getServices，可選：詳情 或 詳細描述(Rich text) 作為內文
 */
export async function getServiceById(pageId) {
  const key = apiKey();
  if (!key || !pageId) return null;
  const notion = new Client({ auth: key });
  try {
    const databaseId = process.env.NOTION_DATABASE_ID_B;
    let props = {};
    if (databaseId) {
      try {
        const dataSourceId = await getDataSourceId(notion, databaseId);
        if (dataSourceId) props = await getSchemaProps(notion, dataSourceId);
      } catch (_) {}
    }
    const nameToId = {};
    for (const [name, prop] of Object.entries(props)) {
      if (prop?.name) nameToId[prop.name] = name;
    }
    const propTitle = nameToId["服務名稱"];
    const propDesc = nameToId["服務描述"];
    const propTag = nameToId["英文 Tag"];
    const propIcon = nameToId["圖示"];
    const propDetail = nameToId["詳情"] || nameToId["詳細描述"];

    const page = await notion.pages.retrieve({ page_id: pageId });
    if (!page?.properties) return null;
    const p = page.properties;
    return {
      id: page.id,
      title: propTitle ? titleText(p[propTitle]) : "未命名服務",
      desc: propDesc ? rt(p[propDesc]) : "",
      tag: propTag ? rt(p[propTag]) : "",
      icon: propIcon && p[propIcon]?.select?.name ? p[propIcon].select.name : "Film",
      detail: propDetail ? rt(p[propDetail]) : "",
    };
  } catch (err) {
    if (isNotionNotFound(err)) return null;
    console.error("[Notion] getServiceById 錯誤:", err.message);
    return null;
  }
}

/**
 * C = 作品集（已有 getPublishedWorks，使用 NOTION_DATABASE_ID）
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
    const dataSourceId = await getDataSourceId(notion, databaseId);
    if (!dataSourceId) return [];
    const props = await getSchemaProps(notion, dataSourceId);
    const nameToId = {};
    for (const [name, prop] of Object.entries(props)) {
      if (prop?.name) nameToId[prop.name] = name;
    }
    const propTitle = nameToId["作品名稱"];
    const propCategory = nameToId["作品分類"];
    const propCover = nameToId["封面圖片"];
    const propLink = nameToId["作品連結"];
    const propPublished = nameToId["發布狀態"];
    if (!propPublished) return [];
    const { results } = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: propPublished, checkbox: { equals: true } },
    });
    return results.map((page) => {
      const p = page.properties;
      let image = "";
      if (propCover && p[propCover]) {
        const cover = p[propCover];
        if (cover.files?.length) {
          const first = cover.files[0];
          image = first.file?.url ?? first.external?.url ?? "";
        } else if (cover.url) image = cover.url;
      }
      const url = propLink && typeof p[propLink]?.url === "string" ? p[propLink].url : "";
      const title = propTitle ? titleText(p[propTitle]) : "未命名作品";
      return {
        id: page.id,
        title,
        slug: slugifyWithId(title, page.id),
        category: propCategory && p[propCategory]?.select ? p[propCategory].select.name : "",
        image: image || undefined,
        url: url || undefined,
      };
    });
  } catch (err) {
    if (isNotionNotFound(err)) {
      warnNotionShareOnce();
      return [];
    }
    console.error("[Notion] getPublishedWorks 錯誤:", err.message);
    return [];
  }
}

/**
 * 取得單一作品（C 資料庫，用於案例分析頁）
 * 欄位同 getPublishedWorks，可選：客戶痛點(Challenge)、創意解法(Solution)、最終成效(Result) — Rich text
 */
export async function getWorkById(pageId) {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID ?? process.env.NOTION_DATABASE_ID_C;
  if (!key || !pageId || !databaseId) return null;
  const notion = new Client({ auth: key });
  try {
    let props = {};
    try {
      const dataSourceId = await getDataSourceId(notion, databaseId);
      if (dataSourceId) props = await getSchemaProps(notion, dataSourceId);
    } catch (_) {}
    const nameToId = {};
    for (const [name, prop] of Object.entries(props)) {
      if (prop?.name) nameToId[prop.name] = name;
    }
    const propTitle = nameToId["作品名稱"];
    const propCategory = nameToId["作品分類"];
    const propCover = nameToId["封面圖片"];
    const propLink = nameToId["作品連結"];
    const propChallenge = nameToId["客戶痛點"];
    const propSolution = nameToId["創意解法"];
    const propResult = nameToId["最終成效"];

    const page = await notion.pages.retrieve({ page_id: pageId });
    if (!page?.properties) return null;
    const p = page.properties;

    let image = "";
    if (propCover && p[propCover]) {
      const cover = p[propCover];
      if (cover.files?.length) {
        const first = cover.files[0];
        image = first.file?.url ?? first.external?.url ?? "";
      } else if (cover.url) image = cover.url;
    }
    const url = propLink && typeof p[propLink]?.url === "string" ? p[propLink].url : "";

    return {
      id: page.id,
      title: propTitle ? titleText(p[propTitle]) : "未命名作品",
      category: propCategory && p[propCategory]?.select ? p[propCategory].select.name : "",
      image: image || undefined,
      url: url || undefined,
      challenge: propChallenge ? rt(p[propChallenge]) : "",
      solution: propSolution ? rt(p[propSolution]) : "",
      result: propResult ? rt(p[propResult]) : "",
    };
  } catch (err) {
    if (isNotionNotFound(err)) return null;
    console.error("[Notion] getWorkById 錯誤:", err.message);
    return null;
  }
}

/**
 * D = 定價方案（發布狀態=true，依排序）
 * 欄位：方案名稱(Title), 價格, 計價單位, 方案描述, 功能列表(Rich text 或 Multi-select), 按鈕文字, 推薦方案(Checkbox), 排序, 發布狀態
 */
export async function getPricingPlans() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID_D;
  if (!key || !databaseId) return [];
  const notion = new Client({ auth: key });
  try {
    const dataSourceId = await getDataSourceId(notion, databaseId);
    if (!dataSourceId) return [];
    const props = await getSchemaProps(notion, dataSourceId);
    const nameToId = {};
    for (const [name, prop] of Object.entries(props)) {
      if (prop?.name) nameToId[prop.name] = name;
    }
    const propPublished = nameToId["發布狀態"];
    const propTitle = nameToId["方案名稱"];
    const propPrice = nameToId["價格"];
    const propUnit = nameToId["計價單位"];
    const propDesc = nameToId["方案描述"];
    const propFeatures = nameToId["功能列表"];
    const propBtn = nameToId["按鈕文字"];
    const propPopular = nameToId["推薦方案"];
    const propSort = nameToId["排序"];
    if (!propPublished) return [];
    const { results } = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: propPublished, checkbox: { equals: true } },
      sorts: propSort ? [{ property: propSort, direction: "ascending" }] : [],
    });
    return results.map((page) => {
      const p = page.properties;
      let features = [];
      if (propFeatures && p[propFeatures]) {
        const f = p[propFeatures];
        if (f.multi_select?.length) features = f.multi_select.map((s) => s.name);
        else if (f.rich_text?.length) {
          const text = rt(f);
          if (text) features = text.split(/\n/).map((s) => s.trim()).filter(Boolean);
        }
      }
      return {
        name: propTitle ? titleText(p[propTitle]) : "",
        price: propPrice ? rt(p[propPrice]) : "",
        priceUnit: propUnit ? rt(p[propUnit]) : "月",
        desc: propDesc ? rt(p[propDesc]) : "",
        features,
        btn: propBtn ? rt(p[propBtn]) : "了解方案",
        popular: propPopular && p[propPopular]?.checkbox === true,
      };
    });
  } catch (err) {
    if (isNotionNotFound(err)) {
      warnNotionShareOnce();
      return [];
    }
    console.error("[Notion] getPricingPlans 錯誤:", err.message);
    return [];
  }
}

/**
 * K = 常見問題（發布狀態=true，依排序）
 * 欄位：問題(Title), 答案(Rich text), 排序(Number), 發布狀態(Checkbox)
 */
export async function getFAQs() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID_K;
  if (!key || !databaseId) return [];
  const notion = new Client({ auth: key });
  try {
    const dataSourceId = await getDataSourceId(notion, databaseId);
    if (!dataSourceId) return [];
    const props = await getSchemaProps(notion, dataSourceId);
    const nameToId = {};
    for (const [name, prop] of Object.entries(props)) {
      if (prop?.name) nameToId[prop.name] = name;
    }
    const propPublished = nameToId["發布狀態"];
    const propQuestion = nameToId["問題"];
    const propAnswer = nameToId["答案"];
    const propSort = nameToId["排序"];
    if (!propQuestion) return [];
    const filter = propPublished ? { property: propPublished, checkbox: { equals: true } } : undefined;
    const { results } = await notion.dataSources.query({
      data_source_id: dataSourceId,
      ...(filter && { filter }),
      sorts: propSort ? [{ property: propSort, direction: "ascending" }] : [],
    });
    return results.map((page) => {
      const p = page.properties;
      return {
        id: page.id,
        question: propQuestion ? titleText(p[propQuestion]) : "",
        answer: propAnswer ? rt(p[propAnswer]) : "",
      };
    }).filter((faq) => faq.question);
  } catch (err) {
    if (isNotionNotFound(err)) {
      warnNotionShareOnce();
      return [];
    }
    console.error("[Notion] getFAQs 錯誤:", err.message);
    return [];
  }
}

/**
 * E = 社群連結（發布狀態=true，依排序）
 * 欄位：名稱(Title), 連結(URL), 排序, 發布狀態
 */
export async function getSocialLinks() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID_E;
  if (!key || !databaseId) return [];
  const notion = new Client({ auth: key });
  try {
    const dataSourceId = await getDataSourceId(notion, databaseId);
    if (!dataSourceId) return [];
    const props = await getSchemaProps(notion, dataSourceId);
    const nameToId = {};
    for (const [name, prop] of Object.entries(props)) {
      if (prop?.name) nameToId[prop.name] = name;
    }
    const propPublished = nameToId["發布狀態"];
    const propTitle = nameToId["名稱"];
    const propUrl = nameToId["連結"];
    const propSort = nameToId["排序"];
    if (!propPublished) return [];
    const { results } = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: propPublished, checkbox: { equals: true } },
      sorts: propSort ? [{ property: propSort, direction: "ascending" }] : [],
    });
    return results.map((page) => {
      const p = page.properties;
      return {
        name: propTitle ? titleText(p[propTitle]) : "",
        url: propUrl && p[propUrl]?.url ? p[propUrl].url : "",
      };
    });
  } catch (err) {
    if (isNotionNotFound(err)) {
      warnNotionShareOnce();
      return [];
    }
    console.error("[Notion] getSocialLinks 錯誤:", err.message);
    return [];
  }
}

/**
 * F = 導覽連結（發布狀態=true，依排序）
 * 欄位：名稱(Title), href(Rich text 或 URL), 排序, 發布狀態
 */
export async function getNavLinks() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID_F;
  if (!key || !databaseId) return [];
  const notion = new Client({ auth: key });
  try {
    const dataSourceId = await getDataSourceId(notion, databaseId);
    if (!dataSourceId) return [];
    const props = await getSchemaProps(notion, dataSourceId);
    const nameToId = {};
    for (const [name, prop] of Object.entries(props)) {
      if (prop?.name) nameToId[prop.name] = name;
    }
    const propPublished = nameToId["發布狀態"];
    const propTitle = nameToId["名稱"];
    const propHref = nameToId["href"];
    const propSort = nameToId["排序"];
    if (!propPublished) return [];
    const { results } = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: propPublished, checkbox: { equals: true } },
      sorts: propSort ? [{ property: propSort, direction: "ascending" }] : [],
    });
    return results.map((page) => {
      const p = page.properties;
      let href = "";
      if (propHref && p[propHref]) {
        if (p[propHref].url) href = p[propHref].url;
        else href = rt(p[propHref]);
      }
      return {
        name: propTitle ? titleText(p[propTitle]) : "",
        href: href || "#",
      };
    });
  } catch (err) {
    if (isNotionNotFound(err)) {
      warnNotionShareOnce();
      return [];
    }
    console.error("[Notion] getNavLinks 錯誤:", err.message);
    return [];
  }
}

/**
 * I = 客戶評價（發布狀態=true，依排序）
 * 欄位：客戶名稱(Title), 評價內容(Rich text), 職稱或公司(Text), 頭像(Files/URL 選填), 發布狀態, 排序
 */
export async function getTestimonials() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID_I;
  if (!key || !databaseId) return [];
  const notion = new Client({ auth: key });
  try {
    const dataSourceId = await getDataSourceId(notion, databaseId);
    if (!dataSourceId) return [];
    const props = await getSchemaProps(notion, dataSourceId);
    const nameToId = {};
    for (const [name, prop] of Object.entries(props)) {
      if (prop?.name) nameToId[prop.name] = name;
    }
    const propPublished = nameToId["發布狀態"];
    const propName = nameToId["客戶名稱"];
    const propQuote = nameToId["評價內容"];
    const propRole = nameToId["職稱或公司"];
    const propAvatar = nameToId["頭像"];
    const propSort = nameToId["排序"];
    if (!propPublished) return [];
    const { results } = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: propPublished, checkbox: { equals: true } },
      sorts: propSort ? [{ property: propSort, direction: "ascending" }] : [],
    });
    return results.map((page) => {
      const p = page.properties;
      let avatar = "";
      if (propAvatar && p[propAvatar]) {
        const v = p[propAvatar];
        if (v.files?.length) avatar = v.files[0]?.file?.url ?? v.files[0]?.external?.url ?? "";
        else if (v.url) avatar = v.url;
      }
      return {
        id: page.id,
        name: propName ? titleText(p[propName]) : "",
        quote: propQuote ? rt(p[propQuote]) : "",
        role: propRole ? rt(p[propRole]) : "",
        avatar: avatar || undefined,
      };
    });
  } catch (err) {
    if (isNotionNotFound(err)) {
      warnNotionShareOnce();
      return [];
    }
    console.error("[Notion] getTestimonials 錯誤:", err.message);
    return [];
  }
}

/**
 * J = 合作品牌（發布狀態=true，依排序）
 * 欄位：品牌名稱(Title), Logo(Files & media 或 URL), 排序, 發布狀態
 */
export async function getPartnerLogos() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID_J;
  if (!key || !databaseId) return [];
  const notion = new Client({ auth: key });
  try {
    const dataSourceId = await getDataSourceId(notion, databaseId);
    if (!dataSourceId) return [];
    const props = await getSchemaProps(notion, dataSourceId);
    const nameToId = {};
    for (const [name, prop] of Object.entries(props)) {
      if (prop?.name) nameToId[prop.name] = name;
    }
    const propPublished = nameToId["發布狀態"];
    const propTitle = nameToId["品牌名稱"];
    const propLogo = nameToId["Logo"];
    const propSort = nameToId["排序"];
    if (!propPublished) return [];
    const { results } = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: propPublished, checkbox: { equals: true } },
      sorts: propSort ? [{ property: propSort, direction: "ascending" }] : [],
    });
    return results.map((page) => {
      const p = page.properties;
      let logo = "";
      if (propLogo && p[propLogo]) {
        const v = p[propLogo];
        if (v.files?.length) logo = v.files[0]?.file?.url ?? v.files[0]?.external?.url ?? "";
        else if (v.url) logo = v.url;
      }
      return {
        id: page.id,
        name: propTitle ? titleText(p[propTitle]) : "",
        logo: logo || undefined,
      };
    });
  } catch (err) {
    if (isNotionNotFound(err)) {
      warnNotionShareOnce();
      return [];
    }
    console.error("[Notion] getPartnerLogos 錯誤:", err.message);
    return [];
  }
}

/**
 * H = 部落格（DCParty_Blog）
 * 欄位：標題(Title), 摘要(Rich text), 分類(Select), 封面圖(Files or URL), 發布狀態(Checkbox)
 * 文章內容來自頁面內文（blocks），由 getBlogPostById 取得
 */
export async function getBlogPosts() {
  const key = apiKey();
  const databaseId = process.env.NOTION_DATABASE_ID_H;
  if (!key || !databaseId) return [];
  const notion = new Client({ auth: key });
  try {
    const dataSourceId = await getDataSourceId(notion, databaseId);
    if (!dataSourceId) return [];
    const props = await getSchemaProps(notion, dataSourceId);
    const nameToId = {};
    for (const [name, prop] of Object.entries(props)) {
      if (prop?.name) nameToId[prop.name] = name;
    }
    const propPublished = nameToId["發布狀態"];
    const propTitle = nameToId["標題"];
    const propExcerpt = nameToId["摘要"];
    const propCategory = nameToId["分類"];
    const propCover = nameToId["封面圖"];
    if (!propPublished) return [];
    const { results } = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: propPublished, checkbox: { equals: true } },
      sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
    });
    return results.map((page) => {
      const p = page.properties;
      let coverImage = "";
      if (propCover && p[propCover]) {
        const cover = p[propCover];
        if (cover.files?.length) {
          const first = cover.files[0];
          coverImage = first.file?.url ?? first.external?.url ?? "";
        } else if (cover.url) coverImage = cover.url;
      }
      const title = propTitle ? titleText(p[propTitle]) : "未命名文章";
      return {
        id: page.id,
        title,
        slug: slugifyWithId(title, page.id),
        excerpt: propExcerpt ? rt(p[propExcerpt]) : "",
        category: propCategory && p[propCategory]?.select ? p[propCategory].select.name : "",
        coverImage: coverImage || undefined,
      };
    });
  } catch (err) {
    if (isNotionNotFound(err)) {
      warnNotionShareOnce();
      return [];
    }
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

    const databaseId =
      (page.parent?.type === "database_id" ? page.parent.database_id : null) ??
      process.env.NOTION_DATABASE_ID_H;
    let props = {};
    if (databaseId) {
      try {
        const dataSourceId = await getDataSourceId(notion, databaseId);
        if (dataSourceId) props = await getSchemaProps(notion, dataSourceId);
      } catch (_) {
        // 忽略，沿用空 props
      }
    }
    const nameToId = {};
    for (const [name, prop] of Object.entries(props)) {
      if (prop?.name) nameToId[prop.name] = name;
    }
    const propTitle = nameToId["標題"];
    const propExcerpt = nameToId["摘要"];
    const propCategory = nameToId["分類"];
    const propCover = nameToId["封面圖"];
    const p = page.properties;
    let coverImage = "";
    if (propCover && p[propCover]) {
      const cover = p[propCover];
      if (cover.files?.length) {
        const first = cover.files[0];
        coverImage = first.file?.url ?? first.external?.url ?? "";
      } else if (cover.url) coverImage = cover.url;
    }
    const post = {
      id: page.id,
      title: propTitle ? titleText(p[propTitle]) : "未命名文章",
      excerpt: propExcerpt ? rt(p[propExcerpt]) : "",
      category: propCategory && p[propCategory]?.select ? p[propCategory].select.name : "",
      coverImage: coverImage || undefined,
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
