#!/bin/bash

# Script de instalação e execução do AIDev no Linux/Mac

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "Node.js não encontrado. Por favor, instale o Node.js de https://nodejs.org/"
    exit 1
fi

# Verifica se o Git está instalado
if ! command -v git &> /dev/null; then
    echo "Git não encontrado. Por favor, instale o Git de https://git-scm.com/"
    exit 1
fi

# Criação de diretório para o AIDev
mkdir -p AIDev
cd AIDev

# Clona repositórios
if [ ! -d "AIDev-Backend" ]; then
    git clone https://github.com/digovc/AIDev-Backend
fi
if [ ! -d "AIDev-Frontend" ]; then
    git clone https://github.com/digovc/AIDev-Frontend
fi

# Instala dependências do Backend
cd AIDev-Backend
npm install

# Instala dependências do Frontend
cd ..
cd AIDev-Frontend
npm install

# Abrir navegador
(sleep 5 && open_browser) &

# Função para abrir o navegador de acordo com o sistema operacional
open_browser() {
    # Tenta diferentes comandos dependendo do sistema
    if command -v open &> /dev/null; then
        # macOS
        open http://localhost:3030
    elif command -v xdg-open &> /dev/null; then
        # Linux com xdg-open
        xdg-open http://localhost:3030
    elif command -v gnome-open &> /dev/null; then
        # Linux com gnome-open
        gnome-open http://localhost:3030
    else
        echo "Não foi possível abrir o navegador automaticamente. Por favor, acesse http://localhost:3030"
    fi
}

# Inicia o Backend e Frontend em terminais separados
# Usa terminais diferentes dependendo do ambiente
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"'/AIDev-Backend && npm run start"'
    osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"'/AIDev-Frontend && npm run start"'
else
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd '$(pwd)/AIDev-Backend' && npm run start; exec bash"
        gnome-terminal -- bash -c "cd '$(pwd)/AIDev-Frontend' && npm run start; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd '$(pwd)/AIDev-Backend' && npm run start" &
        xterm -e "cd '$(pwd)/AIDev-Frontend' && npm run start" &
    else
        echo "Não foi possível abrir terminais automáticos."
        echo "Execute os seguintes comandos em terminais separados:"
        echo "Terminal 1: cd $(pwd)/AIDev-Backend && npm run start"
        echo "Terminal 2: cd $(pwd)/AIDev-Frontend && npm run start"
    fi
fi

echo "Instalação e execução do AIDev concluídas."
