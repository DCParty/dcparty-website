#!/usr/bin/env node
/**
 * 將舊站（WordPress）擷取出的作品內文匯入 Notion Projects 頁面
 *
 *   node scripts/import-wp-content.mjs <extracted.json> --dry          預演，不寫入
 *   node scripts/import-wp-content.mjs <extracted.json>                正式匯入
 *   node scripts/import-wp-content.mjs <extracted.json> --only a,b,c   只匯入指定 slug
 *   node scripts/import-wp-content.mjs --rollback <report.json>        依報告刪除已匯入的 block
 *
 * 安全機制：頁面若已有任何內容一律跳過，絕不覆蓋。
 * 每次匯入都寫報告（含每頁新增的 block id），可用 --rollback 完整還原。
 */
import { Client } from "@notionhq/client";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const env = readFileSync(path.resolve(".env.local"), "utf8");
env.split("\n").forEach(l => { const [k,...v]=l.split("="); if(k&&v.length) process.env[k.trim()]=v.join("=").trim(); });
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const only = (args.find(a=>a.startsWith("--only="))||"").slice(7).split(",").filter(Boolean);
const rb = args.indexOf("--rollback");
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const rt = s => { const out=[]; for (let i=0;i<s.length;i+=2000) out.push({type:"text",text:{content:s.slice(i,i+2000)}}); return out; };

if (rb >= 0) {
  const report = JSON.parse(readFileSync(args[rb+1],"utf8"));
  let n=0;
  for (const r of report.done) for (const id of r.blockIds) { await notion.blocks.delete({block_id:id}); n++; await sleep(300); }
  console.log(`✓ 已刪除 ${n} 個 block（${report.done.length} 頁）`); process.exit(0);
}

const data = JSON.parse(readFileSync(args[0],"utf8")).filter(r => r.sections?.length && (!only.length || only.includes(r.slug)));
const toBlocks = r => {
  const b=[];
  for (const s of r.sections) {
    if (s.heading) b.push({object:"block",type:"heading_2",heading_2:{rich_text:rt(s.heading)}});
    for (const p of s.paras) b.push({object:"block",type:"paragraph",paragraph:{rich_text:rt(p)}});
    if (s.quote) b.push({object:"block",type:"quote",quote:{rich_text:rt(s.quote.text + (s.quote.who?`\n— ${s.quote.who}`:""))}});
  }
  return b;
};

console.log(`${DRY?"[預演] ":""}待匯入 ${data.length} 筆`);
const report = { at:new Date().toISOString(), done:[], skipped:[], failed:[] };
let total=0;
for (const r of data) {
  const blocks = toBlocks(r); total += blocks.length;
  if (DRY) { console.log(`  ${r.slug.padEnd(28)} ${String(blocks.length).padStart(3)} blocks`); continue; }
  try {
    const kids = await notion.blocks.children.list({ block_id:r.notion_id, page_size:3 });
    const hasContent = kids.results.some(b => b.type!=="unsupported" && (b[b.type]?.rich_text?.length>0 || b.type==="image"));
    if (hasContent) { report.skipped.push(r.slug); console.log(`  ⤳ ${r.slug} 已有內容，跳過`); await sleep(300); continue; }
    const ids=[];
    for (let i=0;i<blocks.length;i+=100) {
      const res = await notion.blocks.children.append({ block_id:r.notion_id, children:blocks.slice(i,i+100) });
      ids.push(...res.results.map(b=>b.id)); await sleep(350);
    }
    report.done.push({slug:r.slug, page:r.notion_id, blockIds:ids});
    console.log(`  ✓ ${r.slug.padEnd(28)} ${ids.length} blocks`);
  } catch(e) { report.failed.push({slug:r.slug, error:e.message}); console.log(`  ✗ ${r.slug}: ${e.message.slice(0,80)}`); }
}
if (DRY) { console.log(`\n合計 ${total} blocks。範例 payload（第一筆前 3 個 block）:\n` + JSON.stringify(toBlocks(data[0]).slice(0,3),null,1).slice(0,900)); process.exit(0); }
const out = path.resolve(`import-report-${Date.now()}.json`);
writeFileSync(out, JSON.stringify(report,null,1));
console.log(`\n完成 ${report.done.length} ｜ 跳過 ${report.skipped.length} ｜ 失敗 ${report.failed.length}\n報告: ${out}\n回滾: node scripts/import-wp-content.mjs --rollback ${out}`);
