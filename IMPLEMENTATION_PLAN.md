# 演出技術會議需求管理系統 (Event Technical Requirement Management System)
## Phase 1: 專案掃描與架構規格規劃書 (IMPLEMENTATION_PLAN.md)

---

### 1. 掃描目前專案 (Project Scan)
- **目錄狀態**：當前工作目錄為空目錄（全新專案 / Greenfield Project）。
- **目標定位**：從零構建一套嚴格遵循 **Data-Driven Architecture（資料驅動架構）** 的演出技術會議需求管理平台。

---

### 2. 判斷與推薦 Framework
- **建議技術棧**：**Next.js 14+ (App Router, TypeScript, React 18/19)**
  - **優勢與依據**：
    - 全端整合（Server Components + Server Actions / Route Handlers），減少多餘的 boilerplate，符合「Simplicity First」。
    - 內建 API Route / Server Layer，讓 Service Layer 能完全隔離前端 UI 與 Database。
    - 支援 SSR / SSG 與高效能 Client-side 互動（動態表單即時評估條件邏輯）。

---

### 3. 判斷與推薦 Database
- **建議資料庫與 ORM**：**SQLite (透過 Prisma ORM / Drizzle ORM)** 或 **PostgreSQL**
  - **開發與部署優先**：使用 **Prisma ORM + SQLite**（可無縫切換至 PostgreSQL）。
  - **特點**：
    - 強型別 Schema 驗證，精準支援 UUID 與 JSON 欄位（保存 Snapshot、條件規則運算式）。
    - 支援 Migration 與 Seed 腳本，完美配合 Versioning 與 Soft Delete 機制。

---

### 4. 判斷與推薦 Authentication & Authorization
- **驗證方式**：**NextAuth.js (Auth.js) / JWT Session Authentication**
- **角色型存取控制 (RBAC)**：
  - `USER`（演出/製作/主辦單位）：建立演出、填寫問卷、儲存草稿、送出、查看自身演出、匯出 PDF/Excel。
  - `TECH_MANAGER`（技術主管）：具備 USER 全部權限 + 檢視/修改所有演出、管理分類/題目/選項/條件邏輯/場地、查看 Audit Log。
  - `ADMIN`（系統管理員）：最高權限，包含帳號與權限設定、系統維運。
- **後端安全守則**：所有 API / Server Actions 嚴格校驗使用者 Session、角色 (Role) 與演出擁有權 (Ownership)，不依賴前端按鈕隱藏。

---

### 5. 判斷與推薦 UI Library
- **設計風格**：深色舞台控制台 / 現代極簡專業風格（Dark Mode Ready, Glassmorphism, 現代微動畫，專業舞台技術質感）。
- **樣式與元件庫**：
  - **Tailwind CSS**（搭配標準設計 Tokens：深色調冷灰、專業舞台強調色如琥珀黃、霓虹青、警示紅）。
  - **Lucide React**（專業圖示庫）。
  - **Radix UI / Headless UI**（無障礙且可控的 Dialog, Dropdown, Tabs, Popover 等基礎元件）。

---

### 6. 現有與規劃 Folder Structure

```
演出技術會議需求管理系統/
├── prisma/
│   ├── schema.prisma            # 完整資料庫 Schema 定義
│   ├── migrations/              # 資料庫版本遷移紀錄
│   └── seed.ts                  # 初始五大分類、預設題目與測試 Demo 資料
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # 登入與權限路由
│   │   ├── (dashboard)/         # 管理者與總表儀表板
│   │   │   ├── events/          # 演出列表與管理
│   │   │   ├── admin/           # PAGE 02: 題目/分類/選項/條件邏輯管理
│   │   │   │   ├── categories/
│   │   │   │   ├── questions/
│   │   │   │   └── rules/
│   │   │   ├── summary/[id]/    # PAGE 03: 技術需求總表 (Summary)
│   │   │   └── audit-logs/      # 操作紀錄
│   │   ├── form/[eventId]/      # PAGE 01: 技術會議資料填寫 (動態表單)
│   │   ├── api/                 # RESTful APIs / 匯出端點
│   │   │   ├── export/pdf/
│   │   │   └── export/excel/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/              # UI 元件層
│   │   ├── common/              # 按鈕、輸入框、Modal、Toast、Badge
│   │   ├── form-engine/         # Dynamic Form Engine 核心元件
│   │   │   ├── DynamicForm.tsx
│   │   │   ├── DynamicCategoryTabs.tsx
│   │   │   ├── DynamicQuestion.tsx
│   │   │   ├── QuestionTypeRegistry.ts
│   │   │   └── widgets/         # Dropdown, Radio, Checkbox, Text, Textarea, Number, Date
│   │   ├── admin/               # 後台管理元件 (CategoryList, QuestionEditor, VersionHistory...)
│   │   └── summary/             # 技術需求總表元件 (HighlightSection, CategorySummary...)
│   ├── services/                # 業務邏輯服務層 (Service Layer)
│   │   ├── CategoryService.ts
│   │   ├── QuestionService.ts
│   │   ├── QuestionVersionService.ts
│   │   ├── OptionService.ts
│   │   ├── OptionVersionService.ts
│   │   ├── ConditionalRuleService.ts
│   │   ├── EventService.ts
│   │   ├── AnswerService.ts
│   │   ├── FormSchemaService.ts # 動態組裝表單 Schema
│   │   ├── TechnicalSummaryService.ts # 需求摘要與高亮運算引擎
│   │   ├── ExportService.ts     # 整合 PDF / Excel 匯出
│   │   ├── PdfExportService.ts
│   │   ├── ExcelExportService.ts
│   │   ├── AuditService.ts
│   │   └── UserService.ts
│   ├── lib/                     # 工具庫、Prisma Client、規則評估器
│   │   ├── db.ts
│   │   ├── ruleEngine.ts        # 條件邏輯計算核心
│   │   └── auth.ts
│   └── types/                   # 核心 TypeScript 型別定義
│       ├── schema.ts
│       ├── form.ts
│       └── summary.ts
└── IMPLEMENTATION_PLAN.md       # 本規劃文檔
```

---

### 7. Architecture Plan (全域架構計畫)

```
   ┌──────────────────────────────────────────────────────────┐
   │                    ADMIN / TECH MANAGER                  │
   │               (維護分類 / 題目 / 選項 / 條件邏輯)           │
   └────────────────────────────┬─────────────────────────────┘
                                │ 維護產生版本化設定
                                ▼
   ┌──────────────────────────────────────────────────────────┐
   │                   Configuration Layer                    │
   │   Category ➔ Question ➔ QuestionVersion                  │
   │            ➔ Option   ➔ OptionVersion ➔ ConditionalRule  │
   └────────────────────────────┬─────────────────────────────┘
                                │ 讀取有效 Active Schema
                                ▼
   ┌──────────────────────────────────────────────────────────┐
   │               Dynamic Form Engine (Core)                 │
   │      - QuestionTypeRegistry 註冊機制                      │
   │      - Conditional Logic 評估器 (Show/Hide/Require)       │
   │      - 自動儲存草稿機制 (Auto-save Draft)                │
   └────────────────────────────┬─────────────────────────────┘
                                │ 填寫並提交
                                ▼
   ┌──────────────────────────────────────────────────────────┐
   │                    Event & Answer Layer                  │
   │   Event (草稿/送出) + Answer (含對應 Question/Option Ver) │
   │   + Event Questionnaire Snapshot (送出時鎖定歷史快照)    │
   └────────────────────────────┬─────────────────────────────┘
                                │ 提取並整理結構
                                ▼
   ┌──────────────────────────────────────────────────────────┐
   │              Technical Summary Engine (Core)             │
   │   - 依 Category 自動分組、排除隱藏題                      │
   │   - Technical Highlight Rules (4K, 多軌, 3機以上, 大電等) │
   │   - 產生標準化 TechnicalSummaryObject                    │
   └────────────────────────────┬─────────────────────────────┘
                                │ 共享同一資料結構
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
    ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
    │  Web Summary  │   │  PDF Export   │   │ Excel Export  │
    │   (PAGE 03)   │   │  (A4 規格)    │   │  (3 Sheets)   │
    └───────────────┘   └───────────────┘   └───────────────┘
```

---

### 8. 完整 Database ER Diagram

```mermaid
erDiagram
    USERS ||--o{ EVENTS : "creates"
    USERS ||--o{ AUDIT_LOGS : "triggers"
    VENUES ||--o{ EVENTS : "hosts"
    
    CATEGORIES ||--o{ QUESTIONS : "contains"
    
    QUESTIONS ||--o{ QUESTION_VERSIONS : "has_versions"
    QUESTIONS ||--o{ OPTIONS : "contains"
    QUESTIONS ||--o{ CONDITIONAL_RULES : "is_source_for"
    
    OPTIONS ||--o{ OPTION_VERSIONS : "has_versions"
    
    EVENTS ||--o{ ANSWERS : "has"
    EVENTS ||--o| EVENT_SNAPSHOTS : "locks"
    
    QUESTION_VERSIONS ||--o{ ANSWERS : "references"
    OPTION_VERSIONS ||--o{ ANSWERS : "references"

    CATEGORIES {
        string id PK "cat_uuid"
        string key UK "audio, video..."
        string name "音響, 錄影音..."
        int sortOrder
        boolean enabled
        datetime createdAt
        datetime updatedAt
    }

    QUESTIONS {
        string id PK "q_uuid"
        string categoryId FK
        string key "video_recording..."
        string type "dropdown, radio, text..."
        boolean required
        boolean enabled
        int sortOrder
        string currentVersionId
        datetime createdAt
        datetime updatedAt
    }

    QUESTION_VERSIONS {
        string id PK "qv_uuid"
        string questionId FK
        int version "1, 2, 3..."
        string title "題目名稱"
        string description "說明文字"
        string type "dropdown, text..."
        boolean required
        boolean isActive
        string createdBy FK
        datetime createdAt
    }

    OPTIONS {
        string id PK "opt_uuid"
        string questionId FK
        string currentVersionId
        boolean enabled
        datetime createdAt
        datetime updatedAt
    }

    OPTION_VERSIONS {
        string id PK "ov_uuid"
        string optionId FK
        int version "1, 2, 3..."
        string label "代錄影 HD"
        string value "record_hd"
        int sortOrder
        boolean isActive
        string createdBy FK
        datetime createdAt
    }

    CONDITIONAL_RULES {
        string id PK "rule_uuid"
        string sourceQuestionId FK
        string operator "equals, contains, in..."
        json sourceValue "目標值"
        string action "show, hide, enable, disable, required, optional"
        json targetQuestionIds "受影響題目ID陣列"
        json logicGroup "預留 AND/OR 巢狀條件"
        boolean enabled
        datetime createdAt
        datetime updatedAt
    }

    EVENTS {
        string id PK "evt_uuid"
        string name "2026年度音樂會"
        date eventDate
        string venueId FK
        string formUser "填表人"
        string contactPerson "聯絡人"
        string contactPhone "電話"
        string contactEmail "Email"
        string notes "備註"
        string status "draft | submitted | archived"
        string createdBy FK
        datetime createdAt
        datetime updatedAt
    }

    ANSWERS {
        string id PK "ans_uuid"
        string eventId FK
        string questionId FK
        string questionVersionId FK
        string optionId FK "Nullable"
        string optionVersionId FK "Nullable"
        json value "回答值 (字串/數字/陣列)"
        string valueType "option | multi_option | text | number | date"
        datetime createdAt
        datetime updatedAt
    }

    EVENT_SNAPSHOTS {
        string id PK "snap_uuid"
        string eventId FK UK
        json snapshotData "當時完整 Question/Option/Rule 快照"
        datetime createdAt
    }

    VENUES {
        string id PK "venue_uuid"
        string name "國家音樂廳"
        string address
        boolean enabled
    }

    AUDIT_LOGS {
        string id PK "audit_uuid"
        string userId FK
        string action "CREATE_QUESTION, UPDATE_VERSION..."
        string entityType "Question, Option, Category..."
        string entityId
        json before
        json after
        datetime createdAt
    }

    USERS {
        string id PK "usr_uuid"
        string username UK
        string email UK
        string passwordHash
        string name
        string role "USER | TECH_MANAGER | ADMIN"
        datetime createdAt
    }
```

---

### 9. Entity Relationship 詳細關聯規範
1. **無文字鍵關聯原則**：所有關聯外鍵皆使用永久 ID (`id`)，絕不用題目名稱、選項文字或分類名稱作為 Key。
2. **題目與版本 (1:N)**：`QUESTIONS` 擁有永久 `id` 與 `currentVersionId`；每次題目文字或屬性修改，新增一筆 `QUESTION_VERSIONS`，保留歷史不可篡改性。
3. **選項與版本 (1:N)**：`OPTIONS` 擁有永久 `id` 與 `currentVersionId`；選項標籤更名新增 `OPTION_VERSIONS`。
4. **回答與版本精準綁定**：`ANSWERS` 不僅記錄 `questionId`，還必須記錄當時的 `questionVersionId` 與 `optionVersionId`。
5. **問卷鎖定快照 (Event Snapshot)**：當 Event 狀態轉為 `submitted` 時，系統在 `EVENT_SNAPSHOTS` 儲存完整的問卷結構 JSON，確保即使 10 年後題目被修改或停用，歷史演出檢視依然 100% 忠實還原。
6. **軟刪除 (Soft Delete)**：所有核心主檔（Category, Question, Option）僅更新 `enabled = false`，禁止物理刪除。

---

### 10. UI Wireframe 設計

#### PAGE 01: 技術會議資料填寫 (動態表單)
```
+-----------------------------------------------------------------------+
|  演出技術會議資料填寫系統                           [切換身份: 演出單位]  |
+-----------------------------------------------------------------------+
|  [ 基本資料 ]                                                         |
|  演出名稱: [ 2026年度音樂會_____________________ ]                     |
|  演出日期: [ 2026-09-15 📅 ]       演出地點: [ 國家音樂廳 ▼ ]          |
|  填表人:   [ 王小明 ]  聯絡電話: [ 0912-345678 ]  Email: [ x@mail.com ]|
+-----------------------------------------------------------------------+
|  [ 音響 ]  [ 錄影音 ]  [ INTERCOM ]  [ 投影器材 ]  [ 其他 ]  (+動態分類)|
+-----------------------------------------------------------------------+
|  錄影需求 * :  ( ) 代錄影 BD   (●) 代錄影 HD   ( ) 自錄影   ( ) 無     |
|                                                                       |
|  [條件觸發顯示區塊 - 當 錄影需求 != 無]                                  |
|  ├─ 錄影機位 * :  [ 3機 ▼ ]                                            |
|  ├─ 錄影格式 * :  [ HD ▼ ]                                             |
|  ├─ 錄音需求 * :  [ 多軌錄音 ▼ ]                                        |
|  │  └─ [進階條件觸發] 多軌錄音介面需求: [ Dante / 32ch___________ ]     |
|  └─ 收音來源 :    [ 舞台收音 + FOH 主輸出 ▼ ]                           |
+-----------------------------------------------------------------------+
|  [ 暫存草稿 (Auto-saved 10:20) ]                   [ 預覽總表 / 提交 ] |
+-----------------------------------------------------------------------+
```

#### PAGE 02: 題目 / 選項 / 條件邏輯管理後台 (ADMIN & TECH_MANAGER)
```
+-----------------------------------------------------------------------+
|  技術問卷管理後台                                 [目前管理者: 技術總監] |
+-----------------------------------------------------------------------+
|  [ 分類管理 ]  [ 題目管理 ]  [ 條件邏輯設定 ]  [ 操作紀錄 (Audit Log) ] |
+-----------------------------------------------------------------------+
|  分類選擇: [ 錄影音 ▼ ]                               [ + 新增題目 ]   |
|  -------------------------------------------------------------------- |
|  排序 | 題目 Key           | 目前標題 (版本)    | 題型      | 狀態 | 操作  |
|  10   | video_recording   | 錄影服務需求 (v2)  | dropdown  | 啟用 | 編輯  |
|  20   | video_camera_count| 錄影機位 (v1)      | dropdown  | 啟用 | 編輯  |
|  30   | video_format      | 錄影格式 (v1)      | dropdown  | 啟用 | 編輯  |
+-----------------------------------------------------------------------+
|  [ 編輯題目彈窗: q_video_recording ]                                  |
|  題目識別碼: q_video_recording (永久保留)                              |
|  題目名稱: [ 錄影服務需求_________ ]  (修改將自動產生 Version 3)       |
|  選項列表:                                                             |
|    1. 代錄影 BD   [啟用/停用]                                         |
|    2. 代錄影 HD   [啟用/停用]                                         |
|    3. 4K 專業代錄 [啟用/停用]                                         |
|    4. 無          [啟用/停用]                                         |
|    [ + 新增選項 ]                                                      |
|  條件邏輯連動:                                                         |
|    IF 答案 等於 [ 無 ] THEN [ 隱藏 ] -> [ 錄影機位, 錄影格式, 錄音需求 ] |
|  [ 儲存並發布新版本 ]                                    [ 取消 ]     |
+-----------------------------------------------------------------------+
```

#### PAGE 03: 技術需求總表 (Technical Requirement Summary)
```
+-----------------------------------------------------------------------+
|  TECHNICAL REQUIREMENT SUMMARY                     [ 匯出 PDF ] [ 匯出 Excel ] |
+-----------------------------------------------------------------------+
|  演出名稱：2026年度音樂會         演出日期：2026/09/15                  |
|  演出地點：國家音樂廳             填表人員：王小明                      |
+-----------------------------------------------------------------------+
|  🔴 重要需求摘要 (TECHNICAL HIGHLIGHTS)                               |
|  • 4K投影 / 3機錄影 / 多軌錄音 / 8台以上 INTERCOM                      |
+-----------------------------------------------------------------------+
|  🔊 音響 (Audio)                                                      |
|  ├─ FOH需求: 需要                                                     |
|  ├─ Monitor需求: 需要                                                 |
|  ├─ 無線麥克風: 4支                                                   |
|  └─ DI: 8組                                                           |
|                                                                       |
|  🎥 錄影音 (Video & Recording)                                        |
|  ├─ 錄影方式: 代錄影 HD                                               |
|  ├─ 機位配置: 3機                                                     |
|  ├─ 錄影格式: HD                                                      |
|  └─ 錄音配置: 多軌錄音                                                 |
|                                                                       |
|  🎧 INTERCOM                                                          |
|  ├─ 系統類型: 有線 + 無線 (有線 4組 / 無線 6組)                       |
|                                                                       |
|  📽 投影器材 (Projection)                                              |
|  └─ 投影需求: 2台 / 4K / HDMI + SDI                                   |
+-----------------------------------------------------------------------+
```

---

### 11. Component Tree (元件架構樹)

```
App
├── Layout
│   ├── NavigationBar
│   ├── RoleSwitcher / UserProfile
│   └── ToastContainer
│
├── EventFormPage (PAGE 01)
│   ├── EventBasicInfo (名稱, 日期, 地點, 填表人資訊)
│   ├── DynamicCategoryTabs (動態分類頁籤切換)
│   ├── DynamicFormEngine
│   │   └── DynamicQuestion (依 Registry 映射對應 Widget)
│   │       ├── DropdownQuestion
│   │       ├── RadioQuestion
│   │       ├── CheckboxQuestion
│   │       ├── TextQuestion
│   │       ├── TextareaQuestion
│   │       ├── NumberQuestion
│   │       └── DateQuestion
│   ├── ConditionalRenderer (條件運算包裝器)
│   └── FormFooterBar (草稿狀態指示器, 上一步/下一步, 提交按鈕)
│
├── QuestionAdminPage (PAGE 02)
│   ├── CategoryManager (新增/排序/啟用停用分類)
│   ├── QuestionListTable (依分類瀏覽題目清單)
│   ├── QuestionEditorModal
│   │   ├── QuestionBasicFields
│   │   ├── OptionEditor (選項新增、排序、停用、版本管理)
│   │   └── ConditionalRuleBuilder (視覺化設定 IF-THEN 規則)
│   └── VersionHistoryDrawer (查看題目/選項歷史版本對照)
│
└── TechnicalSummaryPage (PAGE 03)
    ├── EventHeader
    ├── HighlightSection (重要需求警示標籤)
    ├── CategorySummaryCard (依分類動態渲染鍵值對項目)
    └── ExportButtons
        ├── PdfExportButton
        └── ExcelExportButton
```

---

### 12. API / Service Architecture
採用嚴格分層設計，UI 元件絕不直接碰觸資料庫：

```
UI Component (React)
    ↓
Custom Hooks / Client State (useFormEngine, useSummary)
    ↓
Server Actions / API Route Handlers (/api/events, /api/admin/...)
    ↓
Service Layer (獨立單一職責業務服務)
    ├── FormSchemaService (組合 Active Schema)
    ├── TechnicalSummaryService (組裝 TechnicalSummaryObject 與 Highlight)
    ├── EventService / AnswerService (草稿、快照、驗證)
    ├── QuestionService / QuestionVersionService
    └── ExportService (PdfExportService / ExcelExportService)
    ↓
Database (Prisma Client ➔ SQLite / PostgreSQL)
```

---

### 13. Dynamic Form Engine Architecture
- **完全無寫死設計**：前端不預設「音響有幾題」、「錄影有幾題」，全由 `FormSchemaService.getActiveFormSchema()` 動態組裝。
- **QuestionTypeRegistry**：
  ```typescript
  export const QuestionTypeRegistry: Record<string, React.FC<QuestionWidgetProps>> = {
    dropdown: DropdownQuestion,
    radio: RadioQuestion,
    checkbox: CheckboxQuestion,
    text: TextQuestion,
    textarea: TextareaQuestion,
    number: NumberQuestion,
    date: DateQuestion,
    // 未來擴充直接註冊，不更動表單引擎核心：
    // time: TimeQuestion,
    // multiselect: MultiSelectQuestion,
  };
  ```
- **草稿與即時同步**：表單輸入經由 Debounce（500ms）自動提交至草稿儲存 API，避免斷線或瀏覽器關閉遺失資料。

---

### 14. Versioning Architecture (版本化架構)
1. **雙層 ID 架構**：
   - 題目永久 ID：`q_video_recording`（永久不變）。
   - 題目版本 ID：`qv_video_recording_01` (Version 1: 錄影需求), `qv_video_recording_02` (Version 2: 錄影服務需求)。
2. **選項版本化**：
   - 選項永久 ID：`opt_record_hd`。
   - 選項版本 ID：`ov_record_hd_01` (代錄影 HD), `ov_record_hd_02` (HD 代錄影)。
3. **無損發布機制**：
   - 管理者編輯題目/選項文字或設定時，系統觸發「建立新 Version」而非 UPDATE 原有文字。
   - 新建的 Event 採用目前最新的 `isActive = true` 版本。
   - 歷史 Event 保留其原先關聯的 `questionVersionId` 與 `optionVersionId`，或直接讀取 `EventSnapshot`。

---

### 15. Conditional Logic Architecture (條件邏輯架構)
- **支援運算子 (Operators)**：`equals`, `not_equals`, `contains`, `not_contains`, `greater_than`, `less_than`, `in`, `not_in`。
- **支援動作 (Actions)**：`show`, `hide`, `enable`, `disable`, `required`, `optional`。
- **擴充性設計 (AND / OR Group)**：
  ```typescript
  interface ConditionalRule {
    id: string;
    sourceQuestionId: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'greater_than' | 'less_than';
    sourceValue: any;
    action: 'show' | 'hide' | 'enable' | 'disable' | 'required' | 'optional';
    targetQuestionIds: string[];
    logicGroup?: {
      conjunction: 'AND' | 'OR';
      conditions: Array<{ sourceQuestionId: string; operator: string; sourceValue: any }>;
    };
    enabled: boolean;
  }
  ```
- **Rule Evaluation Engine (`ruleEngine.ts`)**：
  在表單狀態變更時，即時運算出每個題目的可見性 (`visible`) 與必填性 (`isRequired`) 狀態矩陣。

---

### 16. PDF / Excel Export Architecture
- **共用統一資料物件 (`TechnicalSummaryObject`)**：
  PDF 與 Excel 匯出不各自解析資料庫，全部透過 `TechnicalSummaryService.generateSummary(eventId)` 取得結構化物件：
  ```typescript
  interface TechnicalSummaryObject {
    event: { id: string; name: string; date: string; venue: string; formUser: string; ... };
    highlights: string[]; // 例如: ['4K投影', '3機錄影', '多軌錄音']
    categories: Array<{
      id: string;
      name: string;
      items: Array<{ questionId: string; question: string; answer: string; highlight?: boolean }>;
    }>;
  }
  ```
- **PDF Export Engine (A4 標準版面)**：
  - 包含系統抬頭、演出資訊、重要需求標記區塊、各技術分類條列式需求、頁碼與產生時間戳記。
- **Excel Export Engine (標準 3 個工作表)**：
  - **Sheet 1: 技術需求總表**（分類、題目、回答、備註）。
  - **Sheet 2: 原始問卷資料**（完整保留 Event ID, Category ID, Question ID, Question Version ID, Option ID, Option Version ID 等詳細追溯資訊）。
  - **Sheet 3: 演出基本資料**（Event ID, 演出名稱, 日期, 地點, 填表人, 狀態, 建立時間）。
  - 自動設定適當欄寬、凍結首列 (Freeze Panes)、啟用自動篩選 (Filter)。

---

### 17. 測試計畫 (Testing & Acceptance Plan)

1. **單元測試 (Unit Tests)**：
   - `Question & Option Version Parser`：驗證版本變更與向下相容解析。
   - `Conditional Logic Engine`：驗證複合條件 (equals, in, AND/OR) 計算結果。
   - `Technical Summary & Highlight Engine`：驗證 4K、多軌、大電等規則命中。
2. **整合測試 (Integration Tests)**：
   - Event 建立 ➔ 動態載入 Schema ➔ 自動儲存草稿 ➔ 提交並鎖定 Snapshot。
   - 驗證 Service Layer 與 Database 互動無依賴前端硬編碼。
3. **關鍵驗收測試 (Critical Acceptance Tests)**：
   - **測試 1（新增題目不改程式）**：ADMIN 於後台新增題目「舞台側補聲需求」，USER 開啟問卷立即呈現，填寫後總表正確顯示。
   - **測試 2（新增分類不改程式）**：ADMIN 於後台新增「燈光」分類與題目，PAGE 01 自動出現燈光頁籤，PAGE 03、PDF 與 Excel 自動包含燈光分類資料。
   - **測試 3（歷史版本不可篡改）**：2025 年演出使用 Version 1，管理員更新題目至 Version 2；2026 年新演出使用 Version 2，查看 2025 年演出依然精準呈現 Version 1 文字。
   - **測試 4（Soft Delete 驗證）**：停用某選項（如「代錄影 BD」），新演出無法選擇該選項，已填寫該選項的舊演出依然正確顯示。
4. **端到端驗收 (E2E Demo Test)**：
   - 建立「2026年度音樂會」Demo 演出，填寫音響、錄影音 (代錄影 HD/3機/多軌)、INTERCOM、投影 (2台/4K)、網路等資料，驗證 Technical Summary 與 PDF / Excel 匯出無誤。

---

### 18. 後續開發階段規劃 (Phases Preview)
- **Phase 2**: 建立專案骨架、Prisma Schema、Database Migration 與 Seed Data。
- **Phase 3**: 建立 Category / Question / QuestionVersion / Option / OptionVersion / ConditionalRule 基礎服務與 API。
- **Phase 4**: 實作 Dynamic Form Engine、QuestionTypeRegistry 與條件運算引擎。
- **Phase 5**: 實作 Event 建立、填寫、Auto-save Draft 與 Submit 快照鎖定機制。
- **Phase 6**: 實作後台題目/選項/分類/版本管理介面 (PAGE 02)。
- **Phase 7**: 實作技術需求總表與 Highlight 引擎 (PAGE 03)。
- **Phase 8**: 實作 PDF Export 與 Excel Export (三 Sheet)。
- **Phase 9**: 實作 Auth & RBAC 與 Audit Log。
- **Phase 10**: 完整自動化測試與 Demo 驗收。
