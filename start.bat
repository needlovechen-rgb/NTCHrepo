@echo off
chcp 65001 >nul
title 演出技術會議需求管理系統

:: ── 檢查是否已安裝 ──────────────────────────────
if not exist "node_modules" (
    echo.
    echo  ⚠️  尚未安裝！請先執行 install.bat
    echo.
    pause
    exit /b 1
)

if not exist "prisma\dev.db" (
    echo.
    echo  ⚠️  資料庫不存在！請先執行 install.bat
    echo.
    pause
    exit /b 1
)

:: ── 啟動伺服器 ───────────────────────────────────
echo.
echo ╔══════════════════════════════════════════╗
echo ║   演出技術會議需求管理系統               ║
echo ║   正在啟動...                            ║
echo ╚══════════════════════════════════════════╝
echo.
echo  網址：http://localhost:3000
echo  關閉此視窗即停止系統
echo.

:: 延遲 2 秒後自動開啟瀏覽器
start /b cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

:: 啟動 Next.js
node node_modules\next\dist\bin\next dev
