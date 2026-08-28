# 📝 Gestor de Tarefas Fullstack (MEVN Stack)

Um laboratório prático de desenvolvimento Fullstack focado em simplicidade e performance. Este projeto implementa um To-Do List (Gestor de Tarefas) utilizando a stack MEVN (MongoDB, Express, Vue.js e Node.js) e foi projetado com uma infraestrutura moderna rodando inteiramente em **Docker** com suporte a **Multi-stage builds**.

Por ser um ambiente de estudos, dispensa complexidades como cadastro de usuários e autenticação, concentrando o foco no fluxo principal de dados: tarefas organizadas por **status** e **categoria**.

---

## 🛠 Tecnologias Utilizadas

* **Backend:** Node.js, Express, Mongoose, Swagger (OpenAPI), `http-status-codes`
* **Frontend:** Vue.js 3 (via Vite), Vuetify (Material Design), Vue Router, Axios, Chart.js
* **Banco de Dados:** MongoDB
* **Testes:** Jest, Supertest, `mongodb-memory-server`
* **Infraestrutura:** Docker, Docker Compose (Multi-stage builds), [`just`](https://just.systems/), GitHub Actions (CI)

---

## 📂 Arquitetura e Estrutura do Projeto

O projeto adota a arquitetura de **Monorepo**, isolando claramente as responsabilidades entre Frontend e Backend, orquestrados pelo Docker Compose. O backend segue um layout em camadas no estilo **MVC** (rotas → controllers → models), com middleware central de tratamento de erros.

```text
simpleTodo/
│
├── docker-compose.yml       # Orquestra Banco, Backend e Frontend
├── justfile                 # Atalhos para o ciclo de vida dos containers
├── .env.example             # Fonte única de configuração (copie para .env)
│
├── backend/                 # 🟢 NODE.JS + EXPRESS + MONGOOSE
│   ├── Dockerfile           # Multi-stage build para a API
│   ├── package.json
│   ├── app.js               # App Express (middlewares + rotas), importável nos testes
│   ├── server.js            # Bootstrap: conecta no banco, semeia e chama listen()
│   ├── config/
│   │   ├── dataBase.js      # Conexão com o MongoDB (Mongoose)
│   │   └── seed.js          # Popula status e categorias iniciais
│   ├── models/              # Schemas Mongoose (TodoModel, StatusModel, CategoryModel)
│   ├── controllers/         # Lógica de negócio (todo, status, category)
│   ├── routes/              # Definição dos endpoints da API
│   ├── middlewares/         # errorHandler (notFound + tratamento central de erros)
│   ├── tests/               # Testes unitários dos endpoints (Jest + Supertest)
│   ├── swagger.js           # Gera swagger-output.json a partir dos models
│   └── swagger-output.json  # Doc OpenAPI gerada, servida em /api-docs
│
└── frontend/                # 🔵 VUE.JS 3 + VUETIFY
    ├── Dockerfile           # Multi-stage build para a interface
    ├── package.json
    ├── vite.config.js       # Configuração do empacotador (Vite)
    ├── index.html
    ├── DESIGN.md            # Sistema de design (tokens, tipografia, paleta)
    └── src/
        ├── main.js          # Ponto de entrada do Vue
        ├── App.vue          # Componente raiz (shell da aplicação)
        ├── router/          # Rotas de navegação (Vue Router)
        ├── views/           # Páginas: Painel, Dashboard, Categorias, Status
        ├── components/      # Componentes isolados (TaskCard, TaskComposer, ...)
        ├── services/        # Cliente HTTP da API (Axios)
        ├── stores/          # Estado compartilhado (catálogo de status/categorias)
        ├── plugins/         # Configuração do Vuetify e utilitários
        ├── styles/          # Tokens e estilos globais (app.css)
        └── utils/           # Helpers (ex.: estados)
```

Fluxo da requisição no backend: **`routes/` → `controllers/` → `models/`**. As rotas apenas mapeiam paths, os controllers concentram a lógica e os models definem schema + validação.

---

## ✨ Funcionalidades

Este projeto foi construído como um ambiente de estudos, com um fluxo de dados
completo e três recursos principais: **tarefas**, **status** e **categorias**.

**Tarefas (Todos)**

* Criar novas tarefas com título, status e categoria.
* Listar todas as tarefas cadastradas (mais recentes primeiro).
* Atualizar título, status ou categoria de uma tarefa.
* Excluir tarefas do banco de dados.

**Status e Categorias (cadastros)**

* CRUD completo de **status** (nome, cor e grupo: *A fazer*, *Em andamento* ou *Concluídos*).
* CRUD completo de **categorias** (nome e cor).
* Catálogo inicial semeado automaticamente na primeira execução (`config/seed.js`).

**Interface (Frontend)**

* **Painel** — tarefas agrupadas por status, com composer de criação inline.
* **Dashboard** — visão analítica das tarefas (gráficos via Chart.js).
* **Categorias** e **Status** — telas de gerenciamento dos cadastros.

---

## 🔌 API REST

Base: `http://localhost:3000/api` · Documentação interativa (Swagger): [`/api-docs`](http://localhost:3000/api-docs)

| Método   | Rota                    | Descrição                          |
|----------|-------------------------|------------------------------------|
| `GET`    | `/api/todos`            | Lista as tarefas (mais recentes primeiro) |
| `POST`   | `/api/todos`            | Cria uma tarefa                    |
| `PATCH`  | `/api/todos/:id`        | Atualiza uma tarefa                |
| `DELETE` | `/api/todos/:id`        | Exclui uma tarefa                  |
| `GET`    | `/api/statuses`         | Lista os status                    |
| `POST`   | `/api/statuses`         | Cria um status                     |
| `PATCH`  | `/api/statuses/:id`     | Atualiza um status                 |
| `DELETE` | `/api/statuses/:id`     | Exclui um status                   |
| `GET`    | `/api/categories`       | Lista as categorias                |
| `POST`   | `/api/categories`       | Cria uma categoria                 |
| `PATCH`  | `/api/categories/:id`   | Atualiza uma categoria             |
| `DELETE` | `/api/categories/:id`   | Exclui uma categoria               |

---

## 🚀 Como Executar Localmente

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
* **Docker** e **Docker Compose**
* **[Just](https://just.systems/)** (Recomendado para facilitar a execução dos comandos)

### 1. Clone o repositório
```bash
git clone https://github.com/LeonardoBagio/simpleTodo.git
cd simpleTodo
```

### 2. Configure as variáveis de ambiente

A configuração vem de um **`.env` único na raiz**. Copie o exemplo e preencha os valores:

```bash
cp .env.example .env
```

Principais variáveis:

| Variável | Descrição |
|---|---|
| `NODE_PORT` | Porta em que a API escuta (padrão `3000`) |
| `FRONTEND_PORT` | Porta do Vite / frontend (padrão `5173`) |
| `TZ` | Fuso horário dos containers (padrão `America/Sao_Paulo`) |
| `DATA_BASE_USER` | Usuário do MongoDB |
| `DATA_BASE_PASSWORD` | Senha do MongoDB |
| `DATA_BASE_NAME` | Nome do banco |
| `DATA_BASE_PORT` | Porta do MongoDB (padrão `27017`) |

> Nunca faça commit de um `.env` real. O `MONGO_URI` do backend é montado
> automaticamente pelo `docker-compose.yml` a partir dos valores `DATA_BASE_*`.

### 3. Gerencie o ambiente com o Just

O projeto conta com um `justfile` que automatiza o ciclo de vida dos containers.
Execute na raiz do projeto:

*   **Listar os comandos disponíveis:**
    ```bash
    just
    ```

*   **Buildar as imagens e subir os containers (recriação forçada):**
    ```bash
    just create
    ```

*   **Iniciar containers já criados:**
    ```bash
    just start
    ```

*   **Parar os containers (mantém os dados):**
    ```bash
    just stop
    ```

*   **Remover containers e rede (mantém o volume do banco):**
    ```bash
    just down
    ```

*   **Acompanhar os logs de um serviço (padrão: `backend`):**
    ```bash
    just logs
    ```

*   **Ver o status dos containers:**
    ```bash
    just status
    ```

*   **Rodar os testes unitários do backend:**
    ```bash
    just test
    ```

### 4. Acesse a aplicação

Após iniciar os serviços, acesse:

*   **Frontend (Painel):** [http://localhost:5173](http://localhost:5173)
*   **Backend (API):** [http://localhost:3000/api/todos](http://localhost:3000/api/todos)
*   **Documentação da API (Swagger):** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 🧪 Testes e CI

Cada endpoint da API tem testes unitários (**Jest + Supertest**), rodando contra
um **MongoDB em memória** (`mongodb-memory-server`) — não é preciso subir o Docker
nem ter um banco real para executá-los.

Rode a partir da raiz do projeto:

```bash
just test
```

Ou diretamente dentro de `backend/`:

```bash
cd backend
npm install   # apenas na primeira vez
npm test
```

A suíte cobre os três recursos (`todos`, `statuses`, `categories`) nos caminhos de
sucesso e de erro — criação, validação de entrada (`400`/`422`), `404` para
recursos inexistentes, `id` inválido e o desvínculo em cascata ao excluir um
status ou categoria.

**Integração Contínua:** o workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
roda a cada `push` e `pull request` na `main`, com dois jobs:

* **backend-tests** — instala as dependências (`npm ci`), gera a doc Swagger e roda `npm test`.
* **docker-build** — valida os *multi-stage builds* das imagens do backend e do frontend.

---

## 🧠 Detalhes de Infraestrutura (Docker)

O `docker-compose.yml` orquestra **três serviços**: `backend`, `frontend` e `database` (MongoDB).

Backend e Frontend utilizam **Multi-stage builds** em seus `Dockerfiles`. O
ambiente de desenvolvimento atualiza o código em tempo real (*Hot-Reload*)
através do espelhamento de volumes (`- ./backend:/usr/src/app` e
`- ./frontend:/usr/src/app`), permitindo editar os arquivos no host com reflexo
imediato nos containers. Os dados do MongoDB persistem no volume nomeado
`mongo_data`.
