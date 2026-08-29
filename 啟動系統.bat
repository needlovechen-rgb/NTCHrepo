@echo off
chcp 65001 >nul
title 演出技術會議需求管理系統

:: ── 取得本腳本所在目錄（即安裝目錄）──────────────
set "APP_DIR=%~dp0"
set "APP_DIR=%APP_DIR:~0,-1%"
set "NODE_EXE=%APP_DIR%\runtime\node.exe"
set "NEXT_BIN=%APP_DIR%\app\node_modules\next\dist\bin\next"

:: ── 確認 runtime\node.exe 存在 ─────────────────────
if not exist "%NODE_EXE%" (
    echo.
    echo  錯誤：找不到 runtime\node.exe
    echo  請重新執行安裝程式。
    echo.
    pause
    exit /b 1
)

:: ── 設定 Prisma 資料庫路徑（使用者資料目錄）───────────
set "DATA_DIR=%APPDATA%\演出技術會議需求管理系統"
if not exist "%DATA_DIR%" mkdir "%DATA_DIR%"

:: 若使用者資料目錄尚無資料庫，從安裝目錄複製初始資料庫
if not exist "%DATA_DIR%\dev.db" (
    if exist "%APP_DIR%\app\prisma\dev.db" (
        copy /y "%APP_DIR%\app\prisma\dev.db" "%DATA_DIR%\dev.db" >nul
    )
)

:: 設定環境變數讓 Prisma 使用正確的資料庫路徑
set "DATABASE_URL=file:%DATA_DIR%\dev.db"

echo.
echo ╔══════════════════════════════════════════╗
echo ║   演出技術會議需求管理系統               ║
echo ║   正在啟動...                            ║
echo ╚══════════════════════════════════════════╝
echo.
echo  資料庫位置：%DATA_DIR%\dev.db
echo  網址：http://localhost:3000
echo  關閉此視窗即停止系統
echo.

:: ── 延遲 3 秒後開啟瀏覽器 ──────────────────────────
start /b cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

:: ── 啟動 Next.js（production mode）────────────────
cd /d "%APP_DIR%\app"
"%NODE_EXE%" "%NEXT_BIN%" start
