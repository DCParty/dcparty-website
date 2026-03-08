# 上線部署建議

本專案為 Next.js + Notion 後台，上線時請依下列步驟操作。

---

## 一、Vercel 部署步驟

### 1. 程式推送到 GitHub

```bash
cd "/Users/dc_15/Cursor project"
git init
git add .
git commit -m "Initial commit"
```

到 [GitHub](https://github.com/new) 建立新 repo（例如 `dcparty-website`），不要勾選「Add .gitignore」以免覆蓋現有設定。然後：

```bash
git remote add origin https://github.com/你的帳號/dcparty-website.git
git branch -M main
git push -u origin main
```

（若專案已是 git repo，只要 `git push` 即可。）  
**注意**：`.env.local` 應已在 `.gitignore`，不會被推送。

### 2. 在 Vercel 建立專案

1. 打開 [vercel.com](https://vercel.com)，用 GitHub 登入。
2. 點 **Add New…** → **Project**。
3. 從列表選剛推送的 repo（例如 `dcparty-website`），點 **Import**。
4. **Framework Preset** 保持 **Next.js**，**Root Directory** 維持空白，直接點 **Deploy**（先不設環境變數沒關係，第一次會建置失敗或首頁缺資料，補完變數後再 Redeploy 即可）。

### 3. 設定環境變數

1. 專案頁左側 **Settings** → **Environment Variables**。
2. 從本機 `.env.local` 複製以下變數，在 Vercel 逐筆新增（Name / Value），環境選 **Production**（必要時也勾選 Preview）：
   - `NOTION_API_KEY`
   - `NOTION_DATABASE_ID`
   - `NOTION_DATABASE_ID_A`、`NOTION_DATABASE_ID_B`、`NOTION_DATABASE_ID_C`、`NOTION_DATABASE_ID_D`、`NOTION_DATABASE_ID_E`、`NOTION_DATABASE_ID_F`
   - `NOTION_DATABASE_ID_CONTACT`
   - `NOTION_DATABASE_ID_H`（部落格 H) DCParty_Blog，選用）
3. 存檔後到 **Deployments** → 最新一次部署右側 **⋯** → **Redeploy**，讓新變數生效。

### 4. 自訂網域（選用）

**Settings** → **Domains** → 輸入你的網域，依畫面指示到 DNS 加上 CNAME 或 A 紀錄即可，HTTPS 由 Vercel 自動處理。

---

## 二、環境變數清單（必設）

在託管平台的 **Environment Variables** 中設定，**不要**把 `.env.local` 提交到 git。

| 變數 | 說明 |
|------|------|
| `NOTION_API_KEY` | Notion Integration Secret |
| `NOTION_DATABASE_ID` | 作品集（C） |
| `NOTION_DATABASE_ID_A` ～ `NOTION_DATABASE_ID_F` | 全站設定、服務、作品集、定價、社群、導覽 |
| `NOTION_DATABASE_ID_CONTACT` | 聯絡表單（G），表單送出寫入此資料庫 |
| `NOTION_DATABASE_ID_H` | 部落格（H) DCParty_Blog），/blog 列表與文章內文來源，選用 |

---

## 三、除錯 API 已關閉

`/api/notion-debug` 僅在 **NODE_ENV=development** 時可存取，正式環境會回傳 404，無需手動刪除檔案。

---

## 四、聯絡表單（選用）

- 表單由 `POST /api/contact` 寫入 Notion，需在託管平台設定 `NOTION_DATABASE_ID_CONTACT`。
- 若擔心濫用，可之後再加：Vercel 邊緣的 rate limit、或表單前端 reCAPTCHA / 簡單 honeypot。

---

## 五、部署後檢查

1. 首頁是否正常顯示（Hero、服務、作品、定價、Footer 等來自 Notion）。
2. 開啟 Contact 彈窗，試送一筆表單，到 Notion「G) DCParty_ContactForm」確認是否新增一筆且處理狀態為「待處理」。
3. 確認 `https://你的網域/api/notion-debug` 回傳 404（表示正式環境已關閉除錯）。

**Notion 內容同步**：首頁、部落格列表與文章頁已設定「每 60 秒再驗證」（ISR）。在 Notion 修改全站設定、服務、作品、定價、部落格等內容後，最多約 1 分鐘內會反映到網站，無需重新部署。若希望立刻看到變更，可到 Vercel Deployments 手動 **Redeploy**。

---

## 六、本機建置測試

上線前可先本地跑一次正式建置與啟動：

```bash
npm run build
npm run start
```

在 `http://localhost:3000` 檢查畫面與表單，與上線行為一致再部署。
