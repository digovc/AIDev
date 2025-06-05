# Resumo Técnico de Onboarding do Projeto AIDev

## 1. Visão Geral do Projeto

O AIDev é uma plataforma projetada para automatizar tarefas em diversos tipos de projetos, utilizando o poder de Modelos de Linguagem Grande (LLMs). O principal objetivo é aumentar a produtividade dos usuários, permitindo que eles deleguem tarefas repetitivas ou trabalhosas para assistentes de Inteligência Artificial.

Ele funciona como um sistema de gerenciamento de projetos (semelhante a ferramentas como Jira ou Trello), mas com a capacidade adicional de fazer com que as tarefas do backlog sejam executadas autonomamente por agentes de IA configuráveis.

### Público-Alvo

O AIDev é destinado a um público amplo, incluindo:

*   **Desenvolvedores:** Para automatizar tarefas como geração de código, escrita de testes unitários, criação de documentação e refatoração.
*   **Criadores de Conteúdo:** Para auxiliar na geração de rascunhos de texto, revisão gramatical, pesquisa de informações e organização de ideias.
*   **Gestores de Projetos:** Para automatizar o acompanhamento de progresso de tarefas, geração de relatórios e comunicação de status.
*   **Qualquer pessoa ou equipe:** Que busque otimizar seu fluxo de trabalho e aumentar a produtividade através da automação inteligente de tarefas.

## 2. Arquitetura do Sistema

O AIDev é estruturado como uma aplicação full-stack, compreendendo dois componentes principais: o Frontend (interface do usuário) e o Backend (servidor e lógica de negócios).

### 2.1. Backend (Diretório: `backend/`)

O Backend é responsável por:

*   **API RESTful:** Prover endpoints para que o Frontend possa gerenciar projetos, tarefas, assistentes de IA e configurações.
*   **Lógica de Negócios:** Implementar todas as regras e fluxos de trabalho do sistema, como criação de projetos, atribuição de tarefas, e o ciclo de vida da execução de tarefas.
*   **Integração com LLMs:** Gerenciar a comunicação com os diferentes provedores de modelos de linguagem grande (OpenAI, Anthropic, Google). Isso inclui o envio de prompts, o tratamento das respostas e o gerenciamento de chaves de API.
*   **Execução de Tarefas:** Orquestrar a execution de tarefas pelos agentes de IA, utilizando as ferramentas configuradas (como manipulação de arquivos, listagem de tarefas, etc.).
*   **Persistência de Dados:** O backend gerencia o armazenamento e a recuperação de dados de projetos, tarefas, etc., através dos `stores` (ex: `projects.store.js`). Dado que os `READMEs` não detalham um banco de dados tradicional, presume-se que a persistência seja em memória ou arquivos locais (como JSON).
*   **Comunicação em Tempo Real:** Utilizar WebSockets (via Socket.IO) para enviar atualizações em tempo real para o Frontend sobre o progresso da execução de tarefas e outras notificações.
*   **Monitoramento de Arquivos:** Utilizar Chokidar para observar mudanças no sistema de arquivos que possam ser relevantes para as tarefas (por exemplo, se um arquivo que a IA precisa ler for modificado).

### 2.2. Frontend (Diretório: `frontend/`)

O Frontend é responsável por:

*   **Interface do Usuário (UI):** Apresentar os dados de forma organizada e intuitiva, permitindo que os usuários interajam com o sistema.
*   **Interação do Usuário:** Capturar as ações do usuário, como criação de projetos, definição de tarefas, configuração de assistentes de IA e disparo da execução de tarefas.
*   **Comunicação com o Backend:** Enviar requisições para a API RESTful do Backend para realizar operações e buscar dados.
*   **Exibição de Dados em Tempo Real:** Receber e exibir atualizações via WebSockets (Socket.IO) para refletir o status atual das tarefas e outros eventos do sistema.
*   **Gerenciamento de Estado Local:** Manter o estado da aplicação no lado do cliente para uma experiência de usuário fluida.

### 2.3. Comunicação entre Camadas

*   **API RESTful:** O Frontend consome a API RESTful exposta pelo Backend para a maioria das operações CRUD (Criar, Ler, Atualizar, Deletar) relacionadas a projetos, tarefas, etc.
*   **WebSockets (Socket.IO):** Para comunicação bidirecional em tempo real, principalmente usada para o Backend notificar o Frontend sobre eventos assíncronos, como o início, progresso e conclusão da execução de tarefas pela IA.

## 3. Tecnologias Utilizadas

A seguir, as principais tecnologias empregadas no desenvolvimento do AIDev:

### 3.1. Backend (`backend/`)

*   **Linguagem:** JavaScript (Node.js)
*   **Framework Principal:** Express.js (para a API RESTful)
*   **Comunicação em Tempo Real:** Socket.IO
*   **Integração com LLMs:**
    *   `@anthropic-ai/sdk` (para Anthropic Claude)
    *   `@google/generative-ai` (para Google Gemini)
    *   `openai` (para OpenAI GPT)
    *   `multi-llm-ts` (possivelmente para abstração ou gerenciamento de múltiplos LLMs)
*   **Monitoramento de Arquivos:** Chokidar
*   **Templating (para prompts):** Nunjucks
*   **Variáveis de Ambiente:** `dotenv`
*   **Utilitários:**
    *   `cors` (para Cross-Origin Resource Sharing)
    *   `nodemon` (para desenvolvimento, reiniciando o servidor automaticamente)
    *   `ignore` (para lidar com arquivos ignorados, similar ao .gitignore)

### 3.2. Frontend (`frontend/`)

*   **Linguagem:** JavaScript
*   **Framework Principal:** Vue.js (Vue 3)
*   **Build Tool e Servidor de Desenvolvimento:** Vite
*   **Estilização:** Tailwind CSS
*   **Gerenciamento de Estado:** Pinia
*   **Roteamento:** Vue Router
*   **Requisições HTTP:** Axios
*   **Comunicação em Tempo Real:** Socket.io-client
*   **Renderização de Markdown:** `vue3-markdown`
*   **Ícones:** Font Awesome (`@fortawesome/vue-fontawesome` e pacotes relacionados)
*   **Utilitários:**
    *   `lodash` (biblioteca de utilitários JavaScript)
    *   `vue-at` / `vue-tribute` (possivelmente para menções @ ou funcionalidades de autocompletar em campos de texto)

### 3.3. Ferramentas Gerais do Projeto

*   **Controle de Versão:** Git
*   **Gerenciador de Pacotes:** NPM (Node Package Manager)
*   **Scripts de Build/Execução:** Shell scripts (`build.sh`, `run.sh`)

## 4. Funcionalidades Chave

O AIDev oferece um conjunto robusto de funcionalidades para gerenciamento e automação de projetos com IA:

### 4.1. Para o Usuário

*   **Gerenciamento de Projetos:**
    *   Criação e organização de múltiplos projetos.
    *   Estruturação de tarefas dentro de cada projeto, similar a um backlog.
*   **Configuração de Assistentes de IA:**
    *   Seleção e configuração de diferentes modelos de LLM (OpenAI, Anthropic, Google) para serem usados em projetos ou tarefas específicas.
*   **Gerenciamento de Tarefas:**
    *   Criação, edição, priorização e exclusão de tarefas.
    *   Visualização do status das tarefas (ex: backlog, em andamento, concluído), potencialmente em um formato de quadro Kanban (inferido pelo `frontend/README.md`).
*   **Execução de Tarefas pela IA:**
    *   Capacidade de delegar tarefas para serem executadas automaticamente pelos assistentes de IA configurados.
    *   Suporte para execução de tarefas individualmente ou em lote.
    *   Possibilidade de execução simultânea de múltiplas tarefas.
*   **Gerenciamento de Referências:**
    *   Adicionar e gerenciar arquivos ou informações de referência que a IA pode utilizar para executar as tarefas.
*   **Interação e Feedback:**
    *   Sistema de chat integrado para fornecer instruções mais detalhadas à IA ou dar feedback sobre o trabalho realizado.
*   **Atualizações em Tempo Real:**
    *   Acompanhamento do progresso das tarefas e outros eventos do sistema através de atualizações via WebSockets.

### 4.2. Para o Agente de IA (Ferramentas Internas)

O backend do AIDev equipa o agente de IA com um conjunto de ferramentas para interagir com o ambiente do projeto e executar as tarefas designadas. Essas ferramentas são cruciais para a capacidade de automação do sistema:

*   **`list-files`:** Permite ao agente listar arquivos e diretórios dentro do escopo do projeto. Isso é fundamental para que a IA possa entender a estrutura de arquivos existente e localizar recursos.
*   **`list-tasks`:** Permite ao agente listar as tarefas existentes no projeto, com a possibilidade de filtrar por status. Isso pode ser usado pela IA para entender o contexto de outras tarefas ou para planejar suas próprias ações.
*   **`read-file`:** Capacita o agente a ler o conteúdo de arquivos específicos dentro do projeto. Essencial para analisar código existente, ler documentos de referência, ou obter dados de entrada para uma tarefa.
*   **`write-file`:** Permite ao agente criar novos arquivos ou modificar arquivos existentes no projeto. Esta é a principal ferramenta para a IA gerar código, escrever documentação, ou salvar os resultados de seu trabalho.
*   **`write-task`:** Permite ao agente adicionar novas tarefas ao projeto ou atualizar tarefas existentes. Isso pode ser usado para criar subtarefas, registrar próximos passos, ou marcar dependências.

Essas ferramentas fornecem à IA a capacidade de interagir de forma programática com o ambiente do projeto, tornando a automação de tarefas complexas uma realidade.

## 5. Fluxo de Trabalho Básico

Um novo desenvolvedor ou usuário geralmente seguirá os seguintes passos ao interagir com o AIDev:

1.  **Criação de um Projeto:**
    *   O usuário começa criando um novo projeto na interface do AIDev. Isso serve como um contêiner para organizar tarefas relacionadas.
    *   Pode-se configurar um assistente de IA padrão para o projeto neste momento ou posteriormente.

2.  **Definição de Tarefas:**
    *   Dentro do projeto, o usuário cria tarefas específicas que precisam ser realizadas.
    *   Cada tarefa deve ter uma descrição clara do que precisa ser feito.
    *   O usuário pode adicionar arquivos de referência à tarefa, que a IA poderá consultar.

3.  **Configuração do Assistente de IA (por tarefa, se necessário):**
    *   Se uma tarefa específica requer um modelo de LLM diferente do padrão do projeto, ou configurações de prompt específicas, o usuário pode ajustar o assistente de IA para aquela tarefa.

4.  **Priorização e Delegação de Tarefas à IA:**
    *   O usuário organiza o backlog de tarefas, priorizando aquelas que devem ser executadas primeiro.
    *   As tarefas prontas para automação são então "delegadas" ou "enviadas" para execução pelo agente de IA.

5.  **Execução pela IA:**
    *   O backend do AIDev recebe a solicitação e instrui o agente de IA configurado a iniciar o trabalho na tarefa.
    *   A IA utiliza suas ferramentas internas (`read-file`, `write-file`, `list-files`, etc.) para interagir com o projeto e realizar o trabalho necessário (ex: escrever código, gerar texto).
    *   O frontend exibe o status da tarefa em tempo real (ex: "Em andamento").

6.  **Revisão do Trabalho:**
    *   Uma vez que a IA completa uma tarefa, o usuário é notificado.
    *   O usuário revisa o trabalho realizado pela IA (ex: código gerado, documento escrito).
    *   Pode haver interação adicional através do chat para pedir ajustes ou refinações.

7.  **Conclusão ou Iteração:**
    *   Se o trabalho estiver satisfatório, o usuário marca a tarefa como "Concluída".
    *   Se forem necessários ajustes, o usuário pode fornecer feedback adicional à IA e solicitar uma nova iteração na tarefa, ou criar tarefas de acompanhamento.

Este fluxo permite uma colaboração eficiente entre o usuário e o agente de IA, onde o usuário foca na estratégia e revisão, enquanto a IA lida com a execução.

## 6. Instruções de Setup e Execução Local

Para configurar e executar o AIDev em um ambiente de desenvolvimento local, siga os passos abaixo.

### 6.1. Pré-requisitos

Certifique-se de ter os seguintes softwares instalados:

*   **Git:** Para clonar o repositório ([https://git-scm.com/](https://git-scm.com/)).
*   **Node.js e NPM:**
    *   Backend: Node.js versão 14 ou superior.
    *   Frontend: Node.js versão 16 ou superior.
    *   (Recomenda-se usar a versão mais recente do Node.js LTS que atenda a ambos)
    *   NPM é distribuído com o Node.js ([https://nodejs.org/](https://nodejs.org/)).
*   **Chaves de API para LLMs (Opcional, para funcionalidade completa):**
    *   Para utilizar os assistentes de IA, você precisará de chaves de API dos respectivos provedores (OpenAI, Anthropic, Google). Estas são configuradas no arquivo `.env` do backend.

### 6.2. Instalação

1.  **Clonar o Repositório:**
    ```bash
    git clone https://github.com/digovc/AIDev # Ou o URL do fork/clone local
    cd AIDev
    ```

2.  **Instalar Dependências e Preparar o Projeto:**
    *   Execute o script `build.sh` localizado na raiz do projeto. Este script deve cuidar da instalação das dependências do frontend e do backend.
    ```bash
    ./build.sh
    ```
    *   **Observação:** Se o `build.sh` não cobrir tudo, ou para instalação manual:
        *   Backend: `cd backend && npm install`
        *   Frontend: `cd frontend && npm install`

### 6.3. Configuração

*   **Backend:**
    *   Navegue até o diretório `backend/`.
    *   Crie um arquivo `.env` copiando o `.env.example` (se existir) ou criando um novo.
    *   Adicione as seguintes variáveis, no mínimo:
        ```dotenv
        PORT=3040 # Porta para o servidor backend
        # Adicione as chaves de API dos LLMs que planeja usar:
        # ANTHROPIC_API_KEY=sua_chave_anthropic
        # OPENAI_API_KEY=sua_chave_openai
        # GOOGLE_API_KEY=sua_chave_google
        ```
*   **Frontend:**
    *   Navegue até o diretório `frontend/`.
    *   Crie um arquivo `.env` (ou `.env.local`) copiando o `.env.example` (se existir) ou criando um novo.
    *   Defina a URL da API do backend:
        ```dotenv
        VITE_API_URL=http://localhost:3040/api
        ```
        (O `README.md` do frontend e as configurações típicas sugerem que a URL da API deve incluir o caminho base `/api` e apontar para a porta do backend `3040`. O `README.md` principal indica que a aplicação frontend é acessada em `http://localhost:3030`.)

### 6.4. Execução

1.  **Iniciar os Servidores:**
    *   Execute o script `run.sh` localizado na raiz do projeto. Este script deve iniciar tanto o servidor backend quanto o servidor de desenvolvimento do frontend.
    ```bash
    ./run.sh
    ```
    *   **Observação:** Se o `run.sh` não funcionar como esperado, ou para execução manual:
        *   Backend: `cd backend && npm run watch` (para desenvolvimento com auto-reload) ou `npm start`.
        *   Frontend: `cd frontend && npm run dev`.

2.  **Acessar a Aplicação:**
    *   Abra seu navegador e acesse `http://localhost:3030` (esta é a porta padrão do frontend mencionada no `README.md` principal).

Mantenha os terminais onde os servidores estão rodando abertos durante o uso da aplicação.

## 7. Pontos de Partida para Novos Desenvolvedores

Para se familiarizar com a codebase do AIDev, um novo desenvolvedor pode considerar explorar as seguintes áreas:

### 7.1. Backend (`backend/src/`)

*   **Manifesto do Pacote (`package.json`):** Analise este arquivo para ter uma visão geral das dependências diretas do módulo e dos scripts de execução comuns.
*   **Rotas e Controladores (`router.js`, `controllers/`):**
    *   Comece pelo `router.js` para entender como as requisições HTTP são mapeadas para os diferentes controladores.
    *   Analise os arquivos em `controllers/` (ex: `projects.controller.js`, `tasks.controller.js`) para ver como as requisições são processadas e como interagem com os serviços.
*   **Serviços (`services/`):**
    *   Os arquivos em `services/` (ex: `agent.service.js`, `task-runner.service.js`) contêm a maior parte da lógica de negócios.
    *   `agent.service.js`: Fundamental para entender como a IA é invocada e como ela utiliza as ferramentas.
    *   `prompt-parser.service.js`: Mostra como os prompts para os LLMs são construídos.
    *   `tool-formatter.service.js`: Detalha como as ferramentas da IA são formatadas e apresentadas ao LLM.
*   **Ferramentas da IA (`tools/`):**
    *   Examine os arquivos em `tools/` (ex: `list-files.tool.js`, `write-file.tool.js`). Cada arquivo representa uma capacidade específica que a IA pode usar. Entender como essas ferramentas funcionam é crucial para compreender as capacidades de automação do sistema.
*   **Stores (`stores/`):**
    *   Os arquivos em `stores/` (ex: `projects.store.js`, `tasks.store.js`) gerenciam a persistência de dados da aplicação (mesmo que seja em memória ou arquivos simples, conforme inferido pela ausência de um DB específico nos READMEs).

### 7.2. Frontend (`frontend/src/`)

*   **Manifesto do Pacote (`package.json`):** Analise este arquivo para ter uma visão geral das dependências diretas do módulo e dos scripts de execução comuns.
*   **Roteamento (`router.js`):**
    *   Similar ao backend, o `router.js` do frontend define as diferentes páginas e como elas são mapeadas para os componentes.
*   **Páginas (`pages/`):**
    *   Explore os componentes dentro de `pages/` para entender a estrutura das principais visualizações da aplicação (ex: `pages/home/`, `pages/project/`).
*   **Componentes (`components/`):**
    *   Analise os componentes reutilizáveis em `components/` para ver como elementos comuns da UI são construídos e gerenciados.
*   **API Services (`api/`):**
    *   Os arquivos em `api/` (ex: `projects.api.js`, `tasks.api.js`) mostram como o frontend se comunica com a API do backend usando Axios.
*   **Gerenciamento de Estado (Stores Pinia - `stores/`):**
    *   Verifique os stores do Pinia para entender como o estado global da aplicação é gerenciado no frontend.
*   **Serviço de WebSocket (`services/socket.io.js`):**
    *   Este arquivo é crucial para entender como o frontend lida com as atualizações em tempo real vindas do backend.

### 7.3. Fluxo de Execução de Tarefa

Para uma compreensão mais profunda, tente rastrear o fluxo de uma tarefa:

1.  **Criação da Tarefa:** Do componente Vue no frontend, passando pela chamada da API, até o controlador e serviço no backend que armazena a tarefa.
2.  **Execução da Tarefa:** Como o usuário dispara a execução, como o `task-runner.service.js` e o `agent.service.js` no backend são acionados, como o prompt é montado, como uma ferramenta da IA (ex: `write-file.tool.js`) é chamada e como o resultado é processado.
3.  **Atualização de Status:** Como o backend notifica o frontend sobre o progresso via Socket.IO e como o frontend reflete essa mudança na UI.

### 7.4. Configuração de Prompts (`backend/assets/prompts/`)

*   Analisar os arquivos Markdown em `backend/assets/prompts/` (ex: `run-task.md`) pode fornecer insights valiosos sobre como as instruções são dadas aos LLMs.

Ao explorar essas áreas e seguir os fluxos de dados, um novo desenvolvedor ganhará uma boa compreensão da arquitetura e funcionamento do AIDev.
