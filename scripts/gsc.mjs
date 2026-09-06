#!/usr/bin/env node
/**
 * Google Search Console 監控腳本
 *
 * 設定方式見 docs/GSC-API設定.md
 * 金鑰路徑預設 ./gsc-key.json（已列入 .gitignore，切勿提交）
 *
 * 用法：
 *   node scripts/gsc.mjs status      索引覆蓋與 sitemap 狀態
 *   node scripts/gsc.mjs queries     近 28 天搜尋查詢排名
 *   node scripts/gsc.mjs pages       近 28 天各頁面成效
 *   node scripts/gsc.mjs sitemap     送出 sitemap
 *   node scripts/gsc.mjs inspect <url>   單一網址索引狀態
 *
 * 選項：
 *   --days=90        變更統計區間（預設 28）
 *   --site=<url>     覆寫網站（預設 https://dcfilms.tv/）
 */
import { google } from "googleapis";
import { existsSync } from "fs";
import path from "path";

const KEY_FILE = process.env.GSC_KEY_FILE || path.resolve("gsc-key.json");
const SITE = arg("site") || "https://dcfilms.tv/";
const DAYS = Number(arg("days") || 28);

function arg(name) {
  const m = process.argv.find((a) => a.startsWith(`--${name}=`));
  return m ? m.split("=").slice(1).join("=") : null;
}

function ymd(d) {
  return d.toISOString().slice(0, 10);
}

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

let _sc;
/** 延後建立 client，讓 --help 之類的用法不必先有金鑰 */
function client() {
  if (!existsSync(KEY_FILE)) {
    fail(
      `找不到金鑰檔：${KEY_FILE}\n` +
        `  請依 docs/GSC-API設定.md 建立服務帳號並下載金鑰，\n` +
        `  放到專案根目錄命名為 gsc-key.json（已在 .gitignore 中）。`
    );
  }
  _sc ??= google.searchconsole({
    version: "v1",
    auth: new google.auth.GoogleAuth({
      keyFile: KEY_FILE,
      scopes: ["https://www.googleapis.com/auth/webmasters"],
    }),
  });
  return _sc;
}

// ── 日期區間 ────────────────────────────────────────────────
// GSC 資料約延遲 2 天
const end = new Date(Date.now() - 2 * 864e5);
const start = new Date(end.getTime() - DAYS * 864e5);

// ── 指令 ────────────────────────────────────────────────────
const CMD = {
  async status() {
    const { data } = await client().sitemaps.list({ siteUrl: SITE });
    console.log(`\n=== Sitemap 狀態｜${SITE} ===`);
    if (!data.sitemap?.length) {
      console.log("  尚未送出任何 sitemap（執行 `node scripts/gsc.mjs sitemap`）");
    } else {
      for (const s of data.sitemap) {
        const submitted = s.contents?.[0]?.submitted ?? "?";
        const indexed = s.contents?.[0]?.indexed ?? "—";
        console.log(`  ${s.path}`);
        console.log(`    最後下載 : ${s.lastDownloaded?.slice(0, 10) ?? "未曾下載"}`);
        console.log(`    已送出   : ${submitted} 筆`);
        console.log(`    已索引   : ${indexed}`);
        if (s.errors) console.log(`    ⚠️ 錯誤 : ${s.errors}`);
        if (s.warnings) console.log(`    ⚠️ 警告 : ${s.warnings}`);
      }
    }

    const { data: tot } = await client().searchanalytics.query({
      siteUrl: SITE,
      requestBody: { startDate: ymd(start), endDate: ymd(end), dimensions: [] },
    });
    const r = tot.rows?.[0];
    console.log(`\n=== 近 ${DAYS} 天總覽（${ymd(start)} ~ ${ymd(end)}）===`);
    if (!r) {
      console.log("  尚無資料。網站剛驗證或尚未被檢索時屬正常。");
    } else {
      console.log(`  曝光   : ${r.impressions}`);
      console.log(`  點擊   : ${r.clicks}`);
      console.log(`  CTR    : ${(r.ctr * 100).toFixed(2)}%`);
      console.log(`  平均排名: ${r.position.toFixed(1)}`);
    }
  },

  async queries() {
    const { data } = await client().searchanalytics.query({
      siteUrl: SITE,
      requestBody: {
        startDate: ymd(start),
        endDate: ymd(end),
        dimensions: ["query"],
        rowLimit: 50,
      },
    });
    console.log(`\n=== 搜尋查詢 Top 50（近 ${DAYS} 天）===`);
    if (!data.rows?.length) return console.log("  尚無資料");
    console.log("  排名   曝光  點擊  查詢");
    for (const r of data.rows) {
      console.log(
        `  ${r.position.toFixed(1).padStart(5)} ${String(r.impressions).padStart(6)} ` +
          `${String(r.clicks).padStart(5)}  ${r.keys[0]}`
      );
    }
  },

  async pages() {
    const { data } = await client().searchanalytics.query({
      siteUrl: SITE,
      requestBody: {
        startDate: ymd(start),
        endDate: ymd(end),
        dimensions: ["page"],
        rowLimit: 50,
      },
    });
    console.log(`\n=== 頁面成效 Top 50（近 ${DAYS} 天）===`);
    if (!data.rows?.length) return console.log("  尚無資料");
    console.log("  排名   曝光  點擊  頁面");
    for (const r of data.rows) {
      console.log(
        `  ${r.position.toFixed(1).padStart(5)} ${String(r.impressions).padStart(6)} ` +
          `${String(r.clicks).padStart(5)}  ${r.keys[0].replace(SITE.replace(/\/$/, ""), "")}`
      );
    }
  },

  async sitemap() {
    const url = `${SITE.replace(/\/$/, "")}/sitemap.xml`;
    await client().sitemaps.submit({ siteUrl: SITE, feedpath: url });
    console.log(`\n✓ 已送出 ${url}`);
    console.log("  Google 需數小時至數天處理，之後可用 `status` 查看結果。");
  },

  async inspect() {
    const target = process.argv[3];
    if (!target || target.startsWith("--")) fail("用法：node scripts/gsc.mjs inspect <完整網址>");
    const { data } = await client().urlInspection.index.inspect({
      requestBody: { inspectionUrl: target, siteUrl: SITE },
    });
    const r = data.inspectionResult?.indexStatusResult ?? {};
    console.log(`\n=== ${target} ===`);
    console.log(`  索引狀態   : ${r.coverageState ?? "?"}`);
    console.log(`  可否編入索引: ${r.verdict ?? "?"}`);
    console.log(`  最後檢索   : ${r.lastCrawlTime?.slice(0, 10) ?? "未曾檢索"}`);
    console.log(`  標準網址   : ${r.googleCanonical ?? "—"}`);
    if (r.robotsTxtState) console.log(`  robots.txt : ${r.robotsTxtState}`);
  },
};

const cmd = process.argv[2];
if (!cmd || !CMD[cmd]) {
  console.log(
    `\n可用指令：status | queries | pages | sitemap | inspect <url>\n` +
      `選項：--days=90  --site=https://example.com/\n`
  );
  process.exit(0);
}

try {
  await CMD[cmd]();
  console.log("");
} catch (e) {
  const msg = e?.errors?.[0]?.message || e.message;
  if (/permission|forbidden|403/i.test(msg)) {
    fail(
      `權限不足：${msg}\n` +
        `  請確認服務帳號的 email 已在 Search Console 加為使用者\n` +
        `  （設定 → 使用者和權限 → 新增使用者，權限選「完整」）。`
    );
  }
  fail(msg);
}
