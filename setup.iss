; ============================================================
; 演出技術會議需求管理系統 — Inno Setup 打包腳本
; ============================================================

#define AppName "演出技術會議需求管理系統"
#define AppVersion "1.0.0"
#define AppPublisher "NTCH"
#define AppURL "http://localhost:3000"

[Setup]
AppId={{A3B4C5D6-E7F8-9012-ABCD-EF1234567890}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
DefaultDirName={autopf}\{#AppName}
DefaultGroupName={#AppName}
AllowNoIcons=yes
; 輸出目錄與檔案名稱
OutputDir=dist
OutputBaseFilename=演出技術會議需求管理系統_安裝程式_v{#AppVersion}
; 壓縮設定（lzma2 兼顧速度與壓縮比）
Compression=lzma2/ultra64
SolidCompression=yes
; 外觀
WizardStyle=modern
; 使用者層級權限（無需管理員密碼，公用電腦可用，且 SQLite 有完整讀寫權限）
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "建立桌面捷徑 (Create desktop shortcut)"; GroupDescription: "附加選項："; Flags: unchecked

[Files]
; ── Node.js 執行環境 ────────────────────────────────────────
Source: "runtime\node.exe"; DestDir: "{app}\runtime"; Flags: ignoreversion

; ── Next.js Build 輸出 ─────────────────────────────────────
Source: ".next\*"; DestDir: "{app}\app\.next"; Flags: ignoreversion recursesubdirs createallsubdirs

; ── node_modules ────────────────────────────────────────────
Source: "node_modules\*"; DestDir: "{app}\app\node_modules"; Flags: ignoreversion recursesubdirs createallsubdirs

; ── 設定檔與伺服器核心 ──────────────────────────────────────
Source: "package.json"; DestDir: "{app}\app"; Flags: ignoreversion
Source: "next.config.mjs"; DestDir: "{app}\app"; Flags: ignoreversion
Source: ".env"; DestDir: "{app}\app"; Flags: ignoreversion skipifsourcedoesntexist
Source: "server.js"; DestDir: "{app}\app"; Flags: ignoreversion

; ── Prisma（結構描述 + 初始資料庫）─────────────────────────
Source: "prisma\schema.prisma"; DestDir: "{app}\app\prisma"; Flags: ignoreversion
Source: "prisma\dev.db"; DestDir: "{app}\app\prisma"; Flags: ignoreversion

; ── 靜態資源 ───────────────────────────────────────────────
Source: "public\*"; DestDir: "{app}\app\public"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist

; ── 啟動腳本 ───────────────────────────────────────────────
Source: "啟動系統.bat"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
; 開始功能表
Name: "{group}\{#AppName}"; Filename: "{app}\啟動系統.bat"; WorkingDir: "{app}"
Name: "{group}\解除安裝 {#AppName}"; Filename: "{uninstallexe}"

; 桌面捷徑（可選）
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\啟動系統.bat"; WorkingDir: "{app}"; Tasks: desktopicon

[Run]
; 安裝完成後詢問是否立即啟動
Filename: "{app}\啟動系統.bat"; Description: "立即啟動系統 (Launch Application)"; Flags: postinstall nowait skipifsilent shellexec

[UninstallDelete]
Type: filesandordirs; Name: "{app}"
