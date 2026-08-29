@echo off
chcp 65001 >nul
title 演出技術會議需求管理系統 — 安裝程式

echo.
echo ╔══════════════════════════════════════════╗
echo ║   演出技術會議需求管理系統               ║
echo ║   安裝程式                               ║
echo ╚══════════════════════════════════════════╝
echo.

:: ── 1. 檢查 Node.js ─────────────────────────────
echo [1/5] 檢查 Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ❌ 找不到 Node.js！
    echo.
    echo  請先安裝 Node.js 18 以上版本：
    echo  https://nodejs.org/zh-tw/download
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo  ✅ Node.js %NODE_VER% 已安裝
echo.

:: ── 2. 安裝 npm 套件 ────────────────────────────
echo [2/5] 安裝相依套件（可能需要 1-3 分鐘）...
call npm install --prefer-offline 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ❌ npm install 失敗，請檢查網路連線後重試。
    pause
    exit /b 1
)
echo  ✅ 套件安裝完成
echo.

:: ── 3. 建立環境設定 ─────────────────────────────
echo [3/5] 設定環境變數...
if not exist ".env" (
    echo DATABASE_URL="file:./dev.db"> .env
    echo  ✅ 已建立 .env
) else (
    echo  ✅ .env 已存在，略過
)
echo.

:: ── 4. 生成 Prisma Client ───────────────────────
echo [4/5] 生成 Prisma Client...
node node_modules\prisma\build\index.js generate
if %errorlevel% neq 0 (
    echo  ❌ Prisma generate 失敗
    pause
    exit /b 1
)
echo  ✅ Prisma Client 生成完成
echo.

:: ── 5. 初始化資料庫 ─────────────────────────────
echo [5/5] 初始化資料庫...
if not exist "prisma\dev.db" (
    node node_modules\prisma\build\index.js db push --skip-generate
    if %errorlevel% neq 0 (
        echo  ❌ 資料庫建立失敗
        pause
        exit /b 1
    )
    echo  ✅ 資料庫建立完成
    echo.
    echo  是否匯入範例資料？
    set /p SEED_CHOICE= （輸入 y 匯入 / 直接 Enter 略過）：
    if /i "%SEED_CHOICE%"=="y" (
        node node_modules\tsx\dist\cli.mjs prisma\seed.ts
        echo  ✅ 範例資料已匯入
    )
) else (
    echo  ✅ 資料庫已存在，略過
)
echo.

:: ── 完成 ────────────────────────────────────────
echo ╔══════════════════════════════════════════╗
echo ║   ✅ 安裝完成！                          ║
echo ║                                          ║
echo ║   請雙擊 start.bat 啟動系統              ║
echo ╚══════════════════════════════════════════╝
echo.
pause
