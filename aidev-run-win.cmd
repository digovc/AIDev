@echo off

REM Script de instalação e execução do AIDev no Windows

REM Verifica se o Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js não encontrado. Por favor, instale o Node.js de https://nodejs.org/
    pause
    exit /b 1
)

REM Verifica se o Git está instalado
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Git não encontrado. Por favor, instale o Git de https://git-scm.com/
    pause
    exit /b 1
)

REM Criação de diretório para o AIDev
mkdir AIDev 2>nul
cd AIDev

REM Clona repositórios
if not exist AIDev-Backend (
    git clone https://github.com/digovc/AIDev-Backend
)
if not exist AIDev-Frontend (
    git clone https://github.com/digovc/AIDev-Frontend
)

REM Instala dependências do Backend
cd AIDev-Backend
call npm install

REM Instala dependências do Frontend
cd ..
cd AIDev-Frontend
call npm install

REM Abre dois terminais para rodar Backend e Frontend
start cmd /k "cd %CD%\..\AIDev-Backend && npm run start"
start cmd /k "cd %CD% && npm run start"

REM Abre o navegador no AIDev
start http://localhost:3030

echo Instalação e execução do AIDev concluídas.
pause