# AIDev: Automatize seus Projetos com IA

![Exemplo](exemple.png)

[![Licença](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

**Uma ferramenta para automatizar tarefas de projetos com o poder da Inteligência Artificial, diretamente no seu computador.**

**🚀 Crie. Automatize. Inove.**

## O que é AIDev?

AIDev é uma ferramenta inovadora inspirada em gerenciadores de projetos como Scrum, mas com um foco revolucionário: **automatizar a execução de tarefas dentro dos seus projetos usando assistentes de Inteligência Artificial (LLMs).**

Imagine poder delegar tarefas complexas e repetitivas para a IA, aumentando sua produtividade e liberando você para se concentrar no que realmente importa: a **criação e a inovação.**

Com AIDev, você pode:

* **Organizar seus projetos:** Crie projetos e defina tarefas de forma clara e estruturada, como em um gerenciador de projetos tradicional.
* **Potencializar com IA:** Integre assistentes de IA de ponta (OpenAI, Anthropic, Google) para executar as tarefas definidas em seus projetos.
* **Automatizar tarefas:** Defina tarefas que são executadas automaticamente pela IA, desde geração de código e textos até organização de arquivos e muito mais.
* **Multitarefas e Multi-projetos:** Execute múltiplas tarefas simultaneamente e gerencie diversos projetos abertos ao mesmo tempo, otimizando seu fluxo de trabalho.

**💡 Para quem é o AIDev?**

AIDev é perfeito para:

* **Desenvolvedores:** Automatize tarefas de codificação, testes, documentação e deploy.
* **Escritores e Criadores de Conteúdo:** Gere rascunhos, revise textos, crie resumos e organize sua pesquisa.
* **Gestores de Projetos:** Automatize o acompanhamento de tarefas, geração de relatórios e comunicação com equipes.
* **Qualquer pessoa** que busca automatizar tarefas em seu computador e aumentar a produtividade com o poder da IA.

## Funcionalidades Principais ✨

* **Criação de Projetos:** Organize seu trabalho em projetos distintos, mantendo tudo estruturado.
* **Assistentes Inteligentes:** Defina e configure assistentes de IA (com suporte para OpenAI, Anthropic e Google) para cada projeto ou tarefa.
* **Criação de Tarefas:** Defina tarefas claras e objetivas dentro de cada projeto, especificando o que precisa ser feito.
* **Execução Automática de Tarefas:** Deixe a IA trabalhar! Execute tarefas individualmente ou em lote, liberando seu tempo.
* **Execução Simultânea:** Aumente sua eficiência executando múltiplas tarefas ao mesmo tempo.
* **Multi-Projetos Abertos:** Trabalhe em diversos projetos simultaneamente, sem perder o foco.
* **Integração com LLMs:** Compatível com as principais APIs de IA do mercado: OpenAI, Anthropic e Google.

## Começando a Usar 🚀

Está pronto para começar a automatizar seus projetos com AIDev? Siga estes passos simples para executar o AIDev localmente:

**Estrutura do Projeto:**

O AIDev é composto por dois repositórios distintos:
* **AIDev-Backend:** Contém a API e a lógica de negócios do sistema
* **AIDev-Frontend:** Contém a interface de usuário e componentes visuais

**Pré-requisitos:**

* **Node.js e NPM (Gerenciador de Pacotes do Node.js) Instalados:** AIDev utiliza Node.js e NPM. Se você não os tiver instalados, siga as instruções em [https://nodejs.org/](https://nodejs.org/) para instalar a versão mais recente recomendada.
* **Configuração via Arquivos `.env`:** Tanto o Frontend quanto o Backend do AIDev possuem arquivos `.env` em seus respectivos diretórios. Estes arquivos permitem configurar diversas opções, incluindo as portas de execução dos servidores.

**Opções de Instalação:**

Você tem duas opções para instalar e executar o AIDev:

### Opção 1: Usando os Scripts de Instalação Automática

Para uma instalação mais rápida e automatizada, você pode usar os scripts fornecidos:

* **No Windows:** Execute o arquivo [aidev-run-win.cmd](https://raw.githubusercontent.com/digovc/AIDev/refs/heads/main/aidev-run-win.cmd)
* **No Linux/Mac:** Execute o arquivo [aidev-run-linux-mac.sh](https://raw.githubusercontent.com/digovc/AIDev/refs/heads/main/aidev-run-linux-mac.sh)

Estes scripts cuidarão de todo o processo, incluindo:
- Clonar ambos os repositórios (frontend e backend)
- Instalar todas as dependências necessárias
- Iniciar os servidores automaticamente
- Abrir o navegador na aplicação

### Opção 2: Instalação Manual Passo a Passo

Se preferir instalar manualmente ou caso encontre problemas com os scripts automáticos, siga estas instruções:

1. **Clone o Repositório do Backend:**
   Abra seu terminal (ou prompt de comando) e execute o seguinte comando para clonar o repositório do backend:

   ```bash
   git clone https://github.com/digovc/AIDev-Backend
   cd AIDev-Backend
   ```

2. **Instale as Dependências do Backend:**
   Dentro da pasta `AIDev-Backend`, execute o seguinte comando para instalar todas as dependências necessárias do backend:

   ```bash
   npm install
   ```

3. **Inicie o Servidor Backend:**
   Ainda na pasta `AIDev-Backend`, inicie o servidor backend com o comando:

   ```bash
   npm run start
   ```
   Deixe este terminal rodando. O backend será iniciado utilizando a porta configurada no arquivo `.env` dentro desta pasta (ou a porta padrão, caso não configurada no `.env`).

4. **Abra um Novo Terminal** (ou janela de terminal).

5. **Clone o Repositório do Frontend:**
   No novo terminal, execute o seguinte comando para clonar o repositório do frontend:

   ```bash
   git clone https://github.com/digovc/AIDev-Frontend
   cd AIDev-Frontend
   ```

6. **Instale as Dependências do Frontend:**
   Dentro da pasta `AIDev-Frontend`, execute o seguinte comando para instalar as dependências do frontend:

   ```bash
   npm install
   ```

7. **Inicie o Frontend:**
   Ainda na pasta `AIDev-Frontend`, inicie o frontend com o comando:

   ```bash
   npm run start
   ```

8. **Abra o AIDev no seu Navegador:**
   Com o frontend e o backend rodando, abra seu navegador e acesse o seguinte endereço:

   ```
   http://localhost:3030
   ```
   Este é o endereço padrão do frontend. Caso você tenha alterado a porta do frontend no arquivo `.env` dentro da pasta `AIDev-Frontend`, utilize a porta configurada por você no lugar de `3030`.

   Parabéns! O AIDev deve estar rodando localmente na sua máquina pronto para ser usado.

**Observações Importantes:**

* **Terminais Abertos:** Mantenha os terminais do Backend e do Frontend abertos enquanto estiver usando o AIDev localmente, pois eles são necessários para a aplicação funcionar.
* **Arquivos `.env`:** Consulte os arquivos `.env` nas pastas `AIDev-Backend` e `AIDev-Frontend` para verificar e configurar as portas e outras opções de configuração.
* **Porta do Frontend (Padrão: 3030):** O frontend é configurado para rodar na porta `3030` por padrão. Se precisar alterar, modifique o arquivo `.env` do frontend e utilize a porta configurada ao acessar no navegador.
* **Erros?** Se você encontrar algum erro durante a instalação ou execução, verifique se você seguiu todos os passos corretamente, se tem os pré-requisitos instalados e se as configurações nos arquivos `.env` estão corretas. Consulte a seção de [**Solução de Problemas (a adicionar)**](#solucao-de-problemas) ou abra uma **Issue** neste repositório para pedir ajuda.

## Contribuições 🤝

Sua ajuda é muito bem-vinda!  AIDev é um projeto open-source e ficaremos muito felizes com suas contribuições.

Você pode contribuir de diversas formas:

* **Desenvolvimento de Funcionalidades:**  Adicione novas funcionalidades, otimize o código existente, corrija bugs.
* **Documentação:** Melhore a documentação, crie tutoriais, traduza o README para outros idiomas.
* **Testes:**  Crie e execute testes para garantir a qualidade e estabilidade do projeto.
* **Design:**  Contribua com melhorias na interface e experiência do usuário.
* **Ideias e Sugestões:** Compartilhe suas ideias para novas funcionalidades e melhorias.

**Como Contribuir:**

1. Faça um **Fork** do repositório.
2. Crie uma **Branch** com sua contribuição (ex: `feature/nova-funcionalidade` ou `fix/bug-na-tarefa`).
3. Faça suas modificações e envie **Commits** claros e descritivos.
4. Envie um **Pull Request** para a branch `main` do repositório original.

**Reportando Bugs e Sugestões:**

Se encontrar algum bug ou tiver sugestões de melhorias, por favor, abra uma **Issue** neste repositório.

## Próximos Passos e Funcionalidades Futuras 🛣️

Estamos trabalhando constantemente para melhorar o AIDev e adicionar novas funcionalidades incríveis, como:

* **Integração com Browser:** Permitir que assistentes de IA interajam com navegadores web para automatizar tarefas online.
* **Referências Baseadas em URLs:**  Permitir que tarefas e assistentes utilizem referências diretas a URLs para dados e informações externas.

## Licença 📄

AIDev é distribuído sob a licença [Apache License 2.0](https://opensource.org/licenses/Apache-2.0).
