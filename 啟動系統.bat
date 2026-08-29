@echo off
title 演出技術會議需求管理系統
cd /d "%~dp0app"
..\runtime\node.exe server.js
pause
