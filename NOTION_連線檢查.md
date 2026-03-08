# Notion 連線檢查清單

你的 `.env.local` 使用的是 **同一個** Integration（API Key 開頭為 `ntn_...`）。  
在 Notion 裡加「Connections」時，**必須選「同一個」這個 Integration**，否則 API 仍會回傳找不到資料庫。

---

## 第一步：確認要用哪一個 Integration

1. 打開 **https://www.notion.so/my-integrations**
2. 找到你用來填 `NOTION_API_KEY` 的那個 Integration（例如「DCParty Website」）。
3. 之後在 Notion 加連線時，**一律選這一個**。若有多個 Integration，選錯就會一直出現 `object_not_found`。

---

## 第二步：逐個資料庫「用正確方式」加連線

每個資料庫都要**單獨**加連線，而且要在**該資料庫自己的頁面**上操作：

1. **先打開「這個資料庫」的獨立頁面**  
   - 在「DCParty 網站後台」頁面，點進其中一個資料庫（例如 A 全站設定）。  
   - 在該資料庫區塊右上角選單裡，點 **「Open as full page」**（或「在新頁面開啟」），讓瀏覽器網址變成**只有這個資料庫**的頁面。

2. **確認網址裡的 ID**  
   網址會像：  
   `https://www.notion.so/xxxxx/資料庫名稱-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...`  
   最後那串 **32 字元**（可能帶連字號）就是這個資料庫的 ID，應與下表一致。

3. **在這一個頁面上加連線**  
   在**這個資料庫獨立頁面**的右上角點 **⋯** → **Connections** → **Connect to** → 選你第一步確認的那個 Integration（例如 DCParty Website）。

4. **對下面 6 個資料庫各做一次 1～3**。

---

## 六個資料庫 ID 對照表（方便你對網址）

| 代號 | 用途         | 你 .env 裡的變數            | Database ID（可對照 Notion 網址） |
|------|--------------|-----------------------------|------------------------------------|
| A    | 全站設定     | NOTION_DATABASE_ID_A       | `87768643-4646-4c5a-af0c-13be675c8b92` |
| B    | 服務         | NOTION_DATABASE_ID_B       | `964a1f27-87a3-4a44-8708-ab3144e4ee2d` |
| C    | 作品集       | NOTION_DATABASE_ID_C       | `f91ab1b6-649d-43f6-8970-a28981d9c045` |
| D    | 定價方案     | NOTION_DATABASE_ID_D       | `a0994084-75a8-424b-88b9-996f93ea11b1` |
| E    | 社群連結     | NOTION_DATABASE_ID_E       | `6d21d0f2-0371-4af0-9241-15103a41a794` |
| F    | 導覽連結     | NOTION_DATABASE_ID_F       | `2039af9b-cb45-4baa-add7-9eae01beec38` |

Notion 網址裡的 ID 可能是 32 字元連在一起、或加連字號，兩種都代表同一個資料庫。

---

## 常見錯誤

- **只連了「DCParty 網站後台」這一個頁面**  
  → 父頁面連線不會讓底下的 A～F 資料庫被 API 看到，要對 **A、B、C、D、E、F 各自** 打開獨立頁面並加連線。

- **在「父頁面」的 ⋯ 加連線**  
  → 要點進**某一個資料庫**，用該資料庫區塊的 **Open as full page**，在**新開的那一頁**的 ⋯ → Connections 加。

- **選到別的 Integration**  
  → 若 Workspace 裡有多個 Integration，務必選和 `NOTION_API_KEY` 同一個的那個（到 notion.so/my-integrations 對名稱）。

---

## 做完後

儲存後重新整理網站或重跑 `npm run dev`，再開 http://localhost:3000 測試。若某一個 ID 仍報錯，對照上表看是哪一個資料庫，再對該資料庫重做「Open as full page → ⋯ → Connections」。
