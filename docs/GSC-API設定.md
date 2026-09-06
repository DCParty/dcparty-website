# Google Search Console API 設定

一次性設定，之後就能用指令查排名與索引狀態，不必登入網頁介面。

---

## 前提：dcfilms.tv 要先在 Search Console 驗證過

還沒驗證的話，先到 https://search.google.com/search-console 新增資源。

建議選 **「網域」** 類型（不是「網址前置字元」），因為網域類型會一併涵蓋
`www`、`http`、`https` 所有變體，省去重複設定。

驗證方式是在 Cloudflare 加一筆 TXT 記錄：

| 欄位 | 值 |
|---|---|
| Type | TXT |
| Name | `@`（或 `dcfilms.tv`） |
| Content | GSC 給你的 `google-site-verification=...` 字串 |

如果你偏好用 HTML meta 標籤驗證，把驗證碼給我，我加進 `layout.tsx` 即可。

---

## 步驟一：建立 Google Cloud 專案與服務帳號

1. 到 https://console.cloud.google.com
2. 建立新專案（名稱隨意，例如 `dcfilms-seo`）
3. 左側選單 → **API 和服務 → 程式庫**
4. 搜尋 **Google Search Console API**，點進去按 **啟用**
5. 左側選單 → **API 和服務 → 憑證**
6. 上方 **建立憑證 → 服務帳戶**
   - 名稱：`gsc-reader`
   - 角色：可略過不選（不需要 GCP 專案層級權限）
7. 建立後點進該服務帳戶 → **金鑰** 分頁 → **新增金鑰 → 建立新的金鑰 → JSON**
8. 瀏覽器會下載一個 `.json` 檔

## 步驟二：授權該帳號存取你的 Search Console

1. 打開剛下載的 JSON，找到 `client_email` 欄位
   （長得像 `gsc-reader@dcfilms-seo.iam.gserviceaccount.com`）
2. 回到 Search Console → **設定 → 使用者和權限**
3. **新增使用者**，貼上那個 email，權限選 **完整**

> 這一步最容易漏。沒做的話 API 會回 403。

## 步驟三：放置金鑰

把下載的 JSON 改名為 `gsc-key.json`，放到專案根目錄：

```
/Users/dc_15/dcparty/.claude/worktrees/affectionate-solomon/gsc-key.json
```

已列入 `.gitignore`，不會被提交。

若想放別的位置，用環境變數指定：

```bash
export GSC_KEY_FILE=/path/to/your-key.json
```

---

## 使用方式

```bash
node scripts/gsc.mjs status
```

| 指令 | 用途 |
|---|---|
| `status` | Sitemap 狀態（已送出／已索引筆數）＋ 區間總覽 |
| `queries` | 搜尋查詢 Top 50，含排名、曝光、點擊 |
| `pages` | 各頁面成效 Top 50 |
| `sitemap` | 送出 sitemap.xml |
| `inspect <url>` | 查單一網址的索引狀態與最後檢索時間 |

選項：

- `--days=90` 變更統計區間（預設 28 天）
- `--site=https://example.com/` 指定其他網站

範例：

```bash
node scripts/gsc.mjs queries --days=90
```

```bash
node scripts/gsc.mjs inspect https://dcfilms.tv/services
```

---

## 這個 API 能做什麼、不能做什麼

| 功能 | 支援 |
|---|---|
| 讀取排名、曝光、點擊、CTR | ✅ |
| 送出 / 查詢 sitemap | ✅ |
| 查詢單一網址索引狀態 | ✅（每日 2000 次額度） |
| **要求建立索引** | ❌ **無 API，只能在網頁介面手動點** |

Google 的 Indexing API 官方僅支援 `JobPosting` 與 `BroadcastEvent` 兩種內容類型，
一般網頁使用違反其使用條款且不會生效。網路上宣稱能用它加速索引的教學都不可信。

另外，舊的 `google.com/ping?sitemap=` 端點 **已於 2023 年停用**（實測回 404），
現在 sitemap 的自動發現靠的是 `robots.txt` 裡的 `Sitemap:` 宣告 —— 本站已有該宣告。

---

## 建議的檢查節奏

上線初期 SEO 變動慢，不需要天天看：

- **每週一次** `status` — 看索引筆數有沒有往 88 靠近
- **每兩週一次** `queries --days=28` — 看有沒有新的查詢字進來
- 首次出現曝光數通常在實體訊號修正後的 4–8 週

若之後想自動化，這支腳本可以掛進排程，把輸出寄到信箱或存成報表。
