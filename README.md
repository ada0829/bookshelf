# 書架 Bookshelf Social

書單分享社群網站，使用 Next.js 14 + Supabase + Claude AI。

## 技術架構

- **前端**：Next.js 14 (App Router) + TypeScript + Tailwind
- **後端/資料庫**：Supabase（PostgreSQL + Auth + RLS）
- **AI**：Claude API 自動生成書籍簡介
- **部署**：Vercel（免費方案即可）

---

## 部署步驟

### 第一步：建立 Supabase 專案

1. 前往 [supabase.com](https://supabase.com) 註冊/登入
2. 點「New Project」建立新專案，記下 **Project URL** 和 **anon key**
3. 進入 **SQL Editor**，把 `supabase_schema.sql` 的全部內容貼上執行

### 第二步：設定 Supabase Auth

1. 在 Supabase Dashboard → **Authentication → Providers**，確認 Email 已啟用
2. **Authentication → URL Configuration** 設定：
   - Site URL：你的 Vercel 網址（之後再填）
   - Redirect URL：`https://你的網址.vercel.app/**`

### 第三步：部署到 Vercel

1. 把這個資料夾推到 GitHub（新建 repo，把整個 bookshelf 資料夾上傳）
2. 前往 [vercel.com](https://vercel.com) → Import Project → 選你的 GitHub repo
3. 在 **Environment Variables** 填入：

```
NEXT_PUBLIC_SUPABASE_URL=https://你的專案ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
ANTHROPIC_API_KEY=你的anthropic_api_key
```

4. 點 Deploy，等待完成

### 第四步：回填網址

部署完成後，把 Vercel 給的網址貼回 Supabase Auth → URL Configuration。

---

## 本地開發

```bash
# 安裝依賴
npm install

# 複製環境變數
cp .env.local.example .env.local
# 編輯 .env.local 填入你的 key

# 啟動開發伺服器
npm run dev
```

開啟 http://localhost:3000

---

## 功能清單

- ✅ 用戶註冊 / 登入（Email + 密碼）
- ✅ 發布書單（書名、作者、分類、評分、書介、心得）
- ✅ AI 自動生成書籍簡介（Claude API）
- ✅ 主頁書單 Feed
- ✅ 按讚 / 收藏
- ✅ 留言
- ✅ 分類篩選
- ✅ 搜尋（書名、作者、用戶名）
- ✅ 排序（最新、最多讚、星等）
- ✅ 個人書架頁面
- ✅ Row Level Security（資料安全）
