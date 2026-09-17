@echo off
chcp 65001 >nul
title Serralheria JRV - Sistema de Orçamentos e Corte 1D
color 06
cd /d "%~dp0"

echo.
echo =====================================================================
echo           SERRALHERIA JRV - SISTEMA DE ORÇAMENTOS E CORTE 1D
echo =====================================================================
echo.
echo  Iniciando o banco de dados SQLite e o servidor local...
echo.

:: 1. Verificar se o Node.js está instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] O Node.js não foi encontrado neste computador!
    echo Para rodar o sistema localmente, instale o Node.js em: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: 2. Verificar se a compilação de produção (pasta dist/) existe
if not exist "dist\index.html" (
    echo [AVISO] Compilando a versão de produção pela primeira vez...
    call npm run build
    echo.
)

:: 3. Abrir o navegador padrão automaticamente após 2 segundos
start "" /b cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

echo  [OK] Servidor ativo em: http://localhost:3000
echo  [OK] Banco de dados:   data\serralheria.db (SQLite Local)
echo.
echo  O seu navegador de internet será aberto automaticamente.
echo.
echo  Para encerrar o sistema, basta fechar esta janela preta.
echo =====================================================================
echo.

:: 4. Iniciar o servidor Node.js
node server.js

pause
