@echo off
title Nihao HSK Server
chcp 65001 >nul
cd /d "%~dp0"

echo ===================================================
echo     NIHAO HSK - HE THONG HOC TIENG TRUNG
echo ===================================================
echo.
echo [*] Dang khoi dong Web Server tai cong 3000...
echo [*] Trang chu:    http://localhost:3000
echo [*] Quan tri:     http://localhost:3000/admin/
echo [*] Tai khoan:    admin / admin@nihao123
echo.
echo [!] Luu y: Bam Ctrl + C khi muon dung server.
echo.

:: Tu dong mo trinh duyet sau 1 giay
start "" http://localhost:3000

:: Chay Python HTTP server tai cong 3000
python -m http.server 3000
if %errorlevel% neq 0 (
    echo.
    echo [!] Port 3000 bi chiem, dang thu cong 8888...
    start "" http://localhost:8888
    python -m http.server 8888
)

pause

