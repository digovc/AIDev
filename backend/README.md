# AIDev Backend

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

AIDev Backend é um servidor Node.js que alimenta o assistente virtual baseado em IA projetado para executar tarefas de um backlog. Esta aplicação fornece a infraestrutura necessária para gerenciar projetos, tarefas e uma interface com modelos avançados de IA para automação de tarefas de desenvolvimento.

## 🚀 Recursos

- **Gerenciamento de Projetos**: Cria e gerencia projetos com backlog de tarefas
- **Execução de Tarefas via IA**: Executa automaticamente tarefas usando agentes de IA
- **API RESTful**: Fornece endpoints para operações CRUD de projetos, tarefas e recursos
- **Comunicação em Tempo Real**: Utiliza Socket.IO para atualizações em tempo real
- **Ferramentas de Desenvolvimento**: Integração com ferramentas para manipulação de arquivos e tarefas
- **Monitoramento de Tarefas**: Rastreia status e progresso das tarefas

## 🛠️ Tecnologias

- **Node.js**: Ambiente de execução JavaScript
- **Express**: Framework para aplicações web
- **Socket.IO**: Comunicação bidirecional em tempo real
- **Anthropic Claude API**: Modelo de IA para execução de tarefas
- **Chokidar**: Monitoramento de alterações em arquivos

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- Conta na Anthropic para acesso à API Claude

## 🔧 Instalação

1. Clone o repositório
   ```bash
   git clone https://github.com/seu-usuario/aidev-backend.git
   cd aidev-backend
   ```

2. Instale as dependências
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente
   - Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
   ```
   PORT=3040
   ANTHROPIC_API_KEY=sua_chave_api_aqui
   ```

4. Inicie o servidor
   ```bash
   npm start
   ```
   
   Para desenvolvimento com recarga automática:
   ```bash
   npm run watch
   ```

## 🚦 Endpoints da API

### Verificação de Saúde
- `GET /health-check` - Verifica o status do servidor

### Projetos
- `GET /projects` - Lista todos os projetos
- `GET /projects/:id` - Obtém detalhes de um projeto específico
- `POST /projects` - Cria um novo projeto
- `PUT /projects/:id` - Atualiza um projeto existente
- `DELETE /projects/:id` - Remove um projeto

### Tarefas
- `GET /tasks` - Lista todas as tarefas
- `GET /tasks/:id` - Obtém detalhes de uma tarefa específica
- `GET /tasks/project/:projectId` - Lista tarefas por projeto
- `POST /tasks` - Cria uma nova tarefa
- `PUT /tasks/:id` - Atualiza uma tarefa existente
- `DELETE /tasks/:id` - Remove uma tarefa
- `POST /tasks/run/:taskId` - Inicia a execução de uma tarefa
- `POST /tasks/stop/:taskId` - Para a execução de uma tarefa
- `POST /tasks/complete/:taskId` - Marca uma tarefa como concluída
- `POST /tasks/archive` - Arquiva várias tarefas

### Outras APIs
- Endpoints para conversar com o agente de IA
- Gerenciamento de arquivos e recursos de referência

## 📁 Estrutura do Projeto

```
├── src/
│   ├── controllers/    # Controladores da API
│   ├── services/       # Lógica de negócios e serviços
│   ├── stores/         # Persistência de dados
│   ├── tools/          # Ferramentas utilizadas pelo agente IA
│   ├── router.js       # Configuração de rotas
│   └── server.js       # Configuração do servidor
├── assets/            # Recursos estáticos
├── .env               # Variáveis de ambiente
├── index.js           # Ponto de entrada da aplicação
└── package.json       # Dependências e scripts
```

## 🧩 Ferramentas do Agente IA

O agente IA tem acesso às seguintes ferramentas:

- **list-files**: Lista diretórios e arquivos do projeto
- **list-tasks**: Lista tarefas do projeto com filtros de status
- **read-file**: Lê o conteúdo de arquivos do projeto
- **write-file**: Cria ou atualiza arquivos no projeto
- **write-task**: Adiciona ou atualiza tarefas do projeto

## 👥 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## 📄 Licença

Este projeto está licenciado sob a licença ISC - veja o arquivo LICENSE para detalhes.
