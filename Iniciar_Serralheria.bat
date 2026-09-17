@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Serralheria JRV - Sistema de Orcamentos
color 06
echo.
echo =====================================================================
echo           SERRALHERIA JRV - SISTEMA DE ORÇAMENTOS E CORTE 1D
echo =====================================================================
echo.
echo  Iniciando o banco de dados SQLite e o servidor local...
echo.
start "" cmd /c "timeout /t 2 /nobreak >nul ^& start http://localhost:3000"
echo  Servidor ativo em: http://localhost:3000
echo  Banco de dados:   data\serralheria.db (SQLite Local)
echo.
echo  O seu navegador de internet será aberto automaticamente.
echo  Para encerrar o sistema, basta fechar esta janela preta.
echo =====================================================================
echo.
node server.js
pause
