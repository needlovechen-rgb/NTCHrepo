@echo off
chcp 65001 >nul
title 演出技術會議需求管理系統 — 打包工具
echo.
echo 正在執行 Windows 安裝檔打包程式...
echo.
node scripts\build-installer.mjs
echo.
pause
