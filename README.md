# AIDev: Automação de Projetos com IA

[![Licença](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

![Exemplo](exemple.png)

**AIDev automatiza tarefas em seus projetos usando o poder da Inteligência Artificial (LLMs).**  Aumente sua produtividade e foque na inovação.

## O que o AIDev faz?

O AIDev é uma plataforma robusta projetada para automatizar tarefas em seus projetos utilizando o poder de Modelos de Linguagem Grande (LLMs). Ele combina a organização de um gerenciador de projetos tradicional com a capacidade de delegar tarefas complexas para assistentes de Inteligência Artificial, permitindo que você:

*   **Organiza:** Estruture seus projetos e tarefas de forma clara e acessível.
*   **Automatiza:** Delegue a execução de tarefas para assistentes de IA configuráveis (compatíveis com OpenAI, Anthropic, Google e outros provedores).
*   **Otimiza:** Aumente sua produtividade, permitindo que a IA cuide de trabalhos como geração de código, escrita de testes, criação de conteúdo, pesquisa e mais.
*   **Itera:** Revise o trabalho da IA, forneça feedback e solicite ajustes para alcançar o resultado desejado.

## Para quem?

*   **Desenvolvedores:** Automatize codificação, testes e documentação.
*   **Criadores de Conteúdo:** Gerem rascunhos, revisem textos e organizem pesquisas.
*   **Gestores de Projetos:**  Automatizem acompanhamento de tarefas e relatórios.
*   **Qualquer pessoa:**  Automatize tarefas e aumente a produtividade com IA.

## Principais Funcionalidades ✨

O AIDev oferece um conjunto abrangente de funcionalidades para otimizar seu fluxo de trabalho:

*   **Gerenciamento Completo de Projetos e Tarefas:** Crie, organize e acompanhe múltiplos projetos e suas respectivas tarefas em um ambiente centralizado.
*   **Assistentes de IA Configuráveis:**
    *   Integração com os principais provedores de LLM (OpenAI, Anthropic, Google).
    *   Configure diferentes assistentes para projetos ou tarefas específicas.
*   **Execução Automatizada de Tarefas:**
    *   Delegue tarefas para serem executadas autonomamente pela IA.
    *   Suporte para execução individual, em lote e simultânea de múltiplas tarefas.
*   **Ferramentas Inteligentes para a IA:** Para realizar suas tarefas, a IA conta com um conjunto de ferramentas, incluindo:
    *   `list-files`: Para entender a estrutura do seu projeto.
    *   `read-file`: Para analisar conteúdo existente.
    *   `write-file`: Para gerar novo código, textos ou outros arquivos.
    *   `list-tasks` e `write-task`: Para interagir com o sistema de tarefas.
*   **Gerenciamento de Referências:** Anexe arquivos e informações relevantes para que a IA os utilize como base para suas tarefas.
*   **Interação e Chat com a IA:** Comunique-se diretamente com os assistentes para refinar instruções e fornecer feedback.
*   **Atualizações em Tempo Real:** Acompanhe o progresso das tarefas através de notificações via WebSockets.

## Arquitetura Resumida 🏗️

O AIDev é construído sobre uma arquitetura full-stack moderna, dividida em dois componentes principais:

*   **Backend (`backend/`):** Desenvolvido em Node.js com Express, é o cérebro da aplicação. Responsável pela API RESTful, lógica de negócios, integração com os LLMs, orquestração da execução de tarefas pela IA e comunicação em tempo real via WebSockets (Socket.IO).
*   **Frontend (`frontend/`):** Uma interface de usuário rica e interativa construída com Vue.js (Vue 3) e Tailwind CSS. Permite aos usuários gerenciar projetos, tarefas, configurar assistentes de IA e interagir com os resultados. Comunica-se com o backend através da API RESTful e recebe atualizações em tempo real.

Para uma descrição mais detalhada da arquitetura, consulte o nosso [Resumo Técnico de Onboarding](TECHNICAL_ONBOARDING_SUMMARY.md).

## Tecnologias Chave 🛠️

O AIDev utiliza um conjunto de tecnologias modernas e robustas:

*   **Backend:**
    *   Node.js, Express.js
    *   Socket.IO (para WebSockets)
    *   SDKs para LLMs: Anthropic, Google Gemini, OpenAI
*   **Frontend:**
    *   Vue.js (Vue 3)
    *   Vite, Pinia, Vue Router
    *   Tailwind CSS
*   **Geral:**
    *   Git, NPM
    *   Shell Scripts para automação de build e execução.

Para uma lista mais exaustiva das tecnologias e bibliotecas, consulte o [Resumo Técnico de Onboarding](TECHNICAL_ONBOARDING_SUMMARY.md).

## Como Começar 🚀

Siga estes passos para configurar e executar o AIDev em seu ambiente local:

**1. Pré-requisitos:**

*   **Git:** Essencial para clonar o repositório. ([Instalação](https://git-scm.com/))
*   **Node.js e NPM:**
    *   Recomendamos Node.js v16 ou superior (LTS).
    *   NPM é incluído com Node.js. ([Instalação](https://nodejs.org/))

**2. Instalação:**

*   **Clone o repositório:**
    ```bash
    git clone https://github.com/digovc/AIDev # Ou o URL do seu fork
    cd AIDev
    ```
*   **Instale as dependências:**
    *   Execute o script `build.sh` na raiz do projeto. Ele cuidará da instalação para o frontend e backend.
    ```bash
    ./build.sh
    ```
    *   (Alternativamente, para instalar manualmente: `cd backend && npm install` e depois `cd frontend && npm install`)

**3. Configuração:**

*   **Backend (`backend/.env`):**
    *   Navegue até a pasta `backend/`.
    *   Crie um arquivo `.env` (você pode copiar de um `backend/.env.example` se disponível).
    *   Defina a porta do servidor (ex: `PORT=3040`).
    *   **Importante:** Para funcionalidade completa da IA, adicione suas chaves de API para os LLMs desejados:
        ```dotenv
        # Exemplo de configuração de chaves de API no backend/.env
        ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
        OPENAI_API_KEY=sk-sua-chave-aqui
        GOOGLE_API_KEY=sua-chave-aqui
        ```
*   **Frontend (`frontend/.env`):**
    *   Navegue até a pasta `frontend/`.
    *   Crie um arquivo `.env` (você pode copiar de um `frontend/.env.example` se disponível).
    *   Configure a URL da API do backend para que o frontend possa se comunicar com ele:
        ```dotenv
        # Exemplo de configuração no frontend/.env
        VITE_API_URL=http://localhost:3040/api
        ```
        *(Certifique-se de que a porta corresponde à configurada no backend e que o caminho `/api` está incluído se for o prefixo das rotas do backend).*

**4. Execução:**

*   **Inicie os servidores:**
    *   Use o script `run.sh` na raiz do projeto. Ele deve iniciar ambos os servidores (backend e frontend).
    ```bash
    ./run.sh
    ```
    *   (Alternativamente, para iniciar manualmente:
        *   Backend: `cd backend && npm run watch`
        *   Frontend: `cd frontend && npm run dev`)
*   **Acesse a Aplicação:**
    *   Abra seu navegador e vá para `http://localhost:3030` (ou a porta que o frontend está servindo, geralmente indicada no terminal após `npm run dev`).

**Observações Importantes:**

*   Mantenha os terminais onde os servidores estão rodando abertos durante o uso.
*   A configuração correta dos arquivos `.env` é crucial, especialmente as chaves de API para os recursos de IA e a URL da API para a comunicação frontend-backend.
*   Em caso de erros, verifique os logs nos terminais, as configurações dos arquivos `.env` e se todos os pré-requisitos foram atendidos.
*   Para um guia mais detalhado de setup e solução de problemas, consulte o [Resumo Técnico de Onboarding](TECHNICAL_ONBOARDING_SUMMARY.md).

## Informações Técnicas Detalhadas 📖

Para desenvolvedores ou usuários que desejam um mergulho mais profundo na arquitetura, tecnologias, fluxos de trabalho detalhados e pontos de partida para contribuição no código, preparamos um **Resumo Técnico de Onboarding**.

👉 **[Acesse o Resumo Técnico de Onboarding aqui](TECHNICAL_ONBOARDING_SUMMARY.md)**

## Contribua 🤝

Ajude a melhorar o AIDev!  Aceitamos contribuições em:

*   **Desenvolvimento:** Novas funcionalidades, otimizações e correções.
*   **Documentação:** Melhorias, tutoriais e traduções.
*   **Testes:**  Garantia de qualidade e estabilidade.
*   **Design:** Melhorias na interface e experiência do usuário.
*   **Ideias:** Sugestões para novas funcionalidades.

**Como Contribuir:**

1.  Fork do repositório.
2.  Crie uma Branch (ex: `feature/nova-funcionalidade`).
3.  Faça commits descritivos.
4.  Envie um Pull Request para a branch `main`.

**Reporte Bugs e Sugestões:** Abra uma Issue.

## Próximos Passos 🛣️

*   **Integração com Browser:** Automatizar tarefas online.
*   **Referências Baseadas em URLs:**  Usar URLs como referências para tarefas e assistentes.

## Licença 📄

[Apache License 2.0](https://opensource.org/licenses/Apache-2.0)
