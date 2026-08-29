# 演出技術會議需求管理系統

本系統為演出場館/團隊之技術需求管理平台，支援動態題庫引擎、跨組別（舞台、燈光、音響、視訊等）需求填寫、條件式連動題型、自動彙總及 Excel / PDF 報表匯出。

---

## 🚀 快速開始（執行方式）

### 1. 下載專案
```bash
git clone https://github.com/needlovechen-rgb/NTCHrepo.git
cd NTCHrepo
```

### 2. 安裝相依套件
```bash
npm install
```

### 3. 初始化資料庫與種子資料
```bash
npx prisma db push
npm run seed
```

### 4. 啟動開發伺服器
```bash
npm run dev
```
啟動後打開瀏覽器訪問：**http://localhost:3000**

---

## 📌 系統功能頁面入口

- **專案列表（首頁）**：`http://localhost:3000/`
- **需求填寫表單**：`http://localhost:3000/form/[eventId]`
- **技術需求彙總表**：`http://localhost:3000/summary/[eventId]`
- **後台題庫與規則管理**：`http://localhost:3000/admin`

---

## 🛠️ 技術架構
- **框架**：Next.js 14 (App Router) + TypeScript
- **樣式**：Tailwind CSS + Lucide Icons
- **資料庫**：SQLite + Prisma ORM
- **匯出功能**：XLSX (Excel) + jsPDF / jsPDF-AutoTable (PDF)
