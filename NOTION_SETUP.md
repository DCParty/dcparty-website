# Notion 作為 Headless CMS 設定說明

本專案首頁的「精選案例」作品集由 Notion 資料庫動態提供，只顯示 **發布狀態** 為勾選的項目。

## 一、建立 Notion Integration 取得 API Key

1. 開啟 [Notion Developers](https://www.notion.so/my-integrations) 。
2. 點 **New integration**，填寫名稱（例如 `DCParty Website`）。
3. 選擇要連結的 Workspace。
4. 建立後在 **Capabilities** 勾選可讀取 **Content**、**Database**（若需要）。
5. 在 **Secrets** 區塊複製 **Internal Integration Secret**，即為 `NOTION_API_KEY`。

## 二、建立資料庫並取得 Database ID

1. 在 Notion 建立一個 **Full page database** 或 **Inline database**。
2. 資料庫欄位請設為（名稱需完全一致）：
   - **作品名稱**：類型選 **Title**
   - **作品分類**：類型選 **Select**（可自訂選項，例如「動態影像 / 廣告」「品牌平面」等）
   - **封面圖片**：類型選 **Files & media**（上傳圖片）或 **URL**
   - **發布狀態**：類型選 **Checkbox**（勾選 = 顯示在網站上）
3. **重要：把「每一個」資料庫都分享給你的 Integration**（否則會出現 `Could not find database`）：
   - 開啟該資料庫的 **頁面**（點進資料庫，不要只在側邊欄點一下）。
   - 右上角 **⋯** → **Connections**（或 **Share**）→ 選擇你建立的 Integration（例如 `DCParty Website`）。
   - 以下每個資料庫都要做一次：**全站設定 (A)**、**服務 (B)**、**作品集 (C)**、**定價 (D)**、**社群連結 (E)**、**導覽連結 (F)**。
4. 取得 **Database ID**：
   - 在瀏覽器打開該資料庫頁面，網址類似：  
     `https://www.notion.so/workspace/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...`
   - 其中 `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`（32 字元）即為 **Database ID**。  
     若網址是 `https://www.notion.so/資料庫名稱-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`，則最後那串 32 字元即為 ID。

## 三、設定 .env.local

1. 在專案根目錄複製範例檔：
   ```bash
   cp .env.example .env.local
   ```
2. 用編輯器開啟 `.env.local`，填入你的值（不要加引號、不要留空格）：
   ```env
   NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. 存檔後重新啟動開發伺服器（`npm run dev`）。  
   `.env.local` 已被 git 忽略，不會被提交到版本庫。

## 四、欄位對應與行為

| Notion 欄位名稱 | 類型        | 網站顯示 |
|-----------------|-------------|----------|
| 作品名稱        | Title       | 作品標題 |
| 作品分類        | Select      | 分類標籤（例如「動態影像 / 廣告」） |
| 封面圖片        | Files & media 或 URL | 卡片封面圖；若為空則使用預設圖 |
| 發布狀態        | Checkbox    | 僅 **勾選為 true** 的項目會出現在首頁 |

修改 Notion 資料庫內容後，重新整理網站或重新 build 即可看到更新（若使用 ISR/on-demand revalidate 可再進階設定）。

**全站設定 (A)** 資料庫可額外設定：
- **品牌Logo**（或 **Logo**）：類型 **Files & media**（上傳圖片）或 **URL**。若有填寫，會顯示於首頁左上角並取代預設 SVG 圖示；點擊可回到首頁。

## 若出現「Could not find database」或 object_not_found

代表該資料庫 **尚未分享給你的 Integration**。請對報錯訊息裡提到的每個 Database ID 對應的資料庫：

1. 在 Notion 中打開該資料庫的 **完整頁面**（不是父頁面）。
2. 點右上角 **⋯** → **Connections** → 選擇你用來當作 `NOTION_API_KEY` 的那個 Integration。
3. 存檔後重新整理網站或重啟 `npm run dev`。

## 五、聯絡表單寫入 Notion（選用）

首頁「Contact Us」彈窗內的表單會將填寫內容寫入一個 Notion 資料庫（例如 **G) DCParty_ContactForm**）。若需要此功能：

1. 在 Notion 建立一個**新資料庫**，欄位名稱需一致：
   - **姓名**：類型 **Title**
   - **Email**：類型 **Email**
   - **電話**：類型 **Phone**
   - **需求說明**：類型 **Text**
   - **處理狀態**：類型 **Select**（選項需包含「待處理」「處理中」「已結案」）；表單送出時會自動帶入「待處理」。
2. 將該資料庫 **Connections** 連到你的 Integration（同上）。
3. 取得該資料庫的 **Database ID**（對該資料庫 Open as full page，網址最後 32 字元），在 `.env.local` 新增：
   ```env
   NOTION_DATABASE_ID_CONTACT=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. Integration 需具備 **Insert content** 權限（Notion 後台 → Capabilities → 勾選「Insert content」）。

若未設定 `NOTION_DATABASE_ID_CONTACT`，表單仍可顯示，但送出時會提示尚未設定。

## 六、部落格 H) DCParty_Blog（選用）

網站 `/blog` 頁面會列出從 Notion 資料庫 **H) DCParty_Blog** 抓取的文章；點進單篇會顯示標題、摘要、分類、封面圖與**頁面內文（blocks）**。

1. 在 Notion 建立一個**新資料庫**（建議命名為 **DCParty_Blog**），欄位名稱需一致：
   - **標題**：類型 **Title**
   - **摘要**：類型 **Text**（或 Rich text），顯示於列表與文章開頭
   - **分類**：類型 **Select**（例如「產業洞察」「案例分享」「技術筆記」）
   - **封面圖**：類型 **Files & media** 或 **URL**
   - **發布狀態**：類型 **Checkbox**（勾選 = 顯示在網站）
2. 每筆資料庫項目即為一篇「文章」：**文章內容**請直接寫在該 Notion 頁面內文（標題、段落、清單、圖片、程式碼等），網站會自動轉成閱讀頁。
3. 將該資料庫 **Connections** 連到你的 Integration。
4. 取得 **Database ID**（該資料庫頁面網址最後 32 字元），在 `.env.local` 新增：
   ```env
   NOTION_DATABASE_ID_H=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
5. 重新整理或重新 build 後，前往 `/blog` 即可看到文章列表；點文章會進入 `/blog/[id]` 閱讀頁。

若未設定 `NOTION_DATABASE_ID_H`，`/blog` 會顯示「尚無文章」。
