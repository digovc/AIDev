# AIDev Frontend

## Descrição

AIDev Frontend é uma interface de usuário moderna para o sistema AIDev, uma plataforma inovadora que combina gerenciamento de projetos (semelhante ao Jira/Trello) com inteligência artificial que executa tarefas automaticamente.

Utilizando Vue 3 e Tailwind CSS, o AIDev Frontend oferece uma experiência de usuário fluida e responsiva para gerenciar projetos e tarefas onde a IA pode executar trabalhos do backlog de forma autônoma.

## Tecnologias

- **Vue 3**: Framework JavaScript progressivo para construção de interfaces
- **Tailwind CSS**: Framework CSS utilitário para design rápido e responsivo
- **Vite**: Build tool e servidor de desenvolvimento rápido
- **Pinia**: Gerenciamento de estado para Vue
- **Vue Router**: Roteamento oficial para aplicações Vue.js
- **Axios**: Cliente HTTP baseado em Promises
- **Socket.io-client**: Cliente para comunicação em tempo real
- **Vue3-Markdown**: Para renderização de conteúdo em Markdown

## Funcionalidades

- **Gerenciamento de Projetos**: Criar e gerenciar múltiplos projetos
- **Quadro de Tarefas**: Visualização de tarefas em backlog, em andamento e concluídas
- **Automação com IA**: Execução automática de tarefas pelo assistente de IA
- **Referências**: Gestão de referências para tarefas
- **Atualização em Tempo Real**: Notificações e atualizações via Socket.io
- **Sistema de Chat**: Integração com IA para instruções e feedback

## Fluxo de trabalho

1. Crie um projeto e adicione tarefas ao backlog
2. Priorize as tarefas que deseja executar
3. O assistente de IA seleciona tarefas do backlog e as executa automaticamente
4. Revise o trabalho realizado pela IA
5. Marque as tarefas como concluídas ou solicite ajustes

## Instalação e Configuração

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone [url-do-repositório]
cd aidev-frontend

# Instale as dependências
npm install
```

### Configuração

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_API_URL=http://localhost:3000/api
```

### Executar localmente

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Iniciar servidor de produção após build
npm start
```

## Estrutura do Projeto

```
src/
├── api/          # Chamadas de API e serviços HTTP
├── assets/       # Recursos estáticos (imagens, etc)
├── components/   # Componentes reutilizáveis
├── pages/        # Componentes de página
│   ├── home/     # Página inicial
│   ├── project/  # Páginas relacionadas a projetos
│   │   └── taks/ # Componentes de tarefas
│   └── splash/   # Página de entrada
├── services/     # Serviços (Socket.io, etc)
├── stores/       # Gerenciamento de estado com Pinia
├── App.vue       # Componente raiz
├── main.js       # Ponto de entrada da aplicação
└── router.js     # Configuração do Vue Router
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença Apache 2.0.

