@echo off
chcp 65001 >nul
title 演出技術會議需求管理系統 — 重置資料庫

echo.
echo ╔══════════════════════════════════════════╗
echo ║   ⚠️  重置資料庫                         ║
echo ║   此操作將刪除所有資料！                 ║
echo ╚══════════════════════════════════════════╝
echo.
set /p CONFIRM= 確定要重置嗎？輸入 YES 確認：
if not "%CONFIRM%"=="YES" (
    echo  已取消。
    pause
    exit /b 0
)

echo.
echo  刪除舊資料庫...
if exist "prisma\dev.db" del /f "prisma\dev.db"
if exist "prisma\dev.db-journal" del /f "prisma\dev.db-journal"

echo  重建資料庫...
node node_modules\prisma\build\index.js db push --skip-generate

echo  匯入初始資料...
node node_modules\tsx\dist\cli.mjs prisma\seed.ts

echo.
echo  ✅ 資料庫重置完成！
pause
