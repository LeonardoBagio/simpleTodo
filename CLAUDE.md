# CLAUDE.md

Orientações para o Claude Code (e para pessoas contribuidoras) ao trabalhar
neste repositório. Documenta o projeto e as convenções a seguir.

## Objetivo do projeto

`simpleTodo` é um **laboratório prático de desenvolvimento Fullstack focado em
simplicidade e performance**. É um ambiente de estudos que implementa um gestor de
tarefas (To-Do List) com a stack MEVN (MongoDB, Express, Vue, Node.js), rodando
inteiramente em Docker com **multi-stage builds**. Por ser um laboratório, ele
dispensa complexidades como tabelas de usuários e foca no fluxo principal de
dados.

Funcionalidades implementadas:

- Criar, listar (mais recentes primeiro), editar e excluir tarefas.
- Vincular cada tarefa a um **status** (andamento) e a uma **categoria**, ambos
  cadastráveis.
- Registrar o **número da issue do GitHub** de cada tarefa (campo `issue`, texto
  livre).
- Painel agrupado por status, busca, filtro por categoria e um **dashboard** com
  gráficos (Chart.js).
- Cadastros próprios de **status** e **categoria** (CRUD completo).

## Visão geral do projeto

Stack MEVN em monorepo, orquestrada com Docker Compose. Os três serviços
(`backend`, `frontend`, `database`) estão ativos no `docker-compose.yml`.

- **Backend** — Node.js, Express, Mongoose sobre MongoDB.
- **Frontend** — Vue.js 3 (via Vite), Vuetify (Material Design), Vue Router,
  Axios e Chart.js.
- **Banco de dados** — MongoDB (com seed automático de status e categorias).
- **Infraestrutura** — Docker + Docker Compose com multi-stage builds e hot-reload
  via espelhamento de volumes.

Estrutura do monorepo:

- **`backend/`** — API Node.js + Express + Mongoose.
- **`frontend/`** — SPA Vue 3 + Vuetify (implementada).

## Arquitetura

### Backend

Layout em camadas no estilo MVC. Mantenha cada responsabilidade em sua própria
camada.

```text
backend/
├── server.js              # Bootstrap: dotenv, conexão, seed, listen(), shutdown gracioso
├── app.js                 # Instância Express: middlewares + wiring das rotas
├── config/
│   ├── dataBase.js        # Conexão com o MongoDB (Mongoose)
│   └── seed.js            # Popula status e categorias padrão na 1ª subida
├── models/                # Schemas do Mongoose (Todo, Status, Category)
├── controllers/           # Handlers de requisição / lógica de negócio
├── routes/                # Routers do Express → mapeamento para controllers
├── middlewares/
│   └── errorHandler.js    # notFound + tratamento central de erros
├── tests/                 # Jest + Supertest (helpers/db.js usa mongodb-memory-server)
├── swagger.js             # Gera swagger-output.json a partir dos models
└── swagger-output.json    # Doc OpenAPI gerado, servido em /api-docs
```

Fluxo da requisição: `routes/` → `controllers/` → `models/`. Não coloque queries
de banco nas rotas nem lógica HTTP nos models. Erros são propagados via `next(err)`
para o `errorHandler` central (traduz `CastError` → 400 e `ValidationError` → 422).

**Modelos:**

- `Todo` — `title` (obrigatório), `issue` (texto, opcional), `status` e `category`
  (referências a `Status`/`Category`, podem ser `null`), `timestamps`.
- `Status` — `label`, `color`, `group` (`a_fazer` | `em_andamento` |
  `concluidos`), `sortOrder`.
- `Category` — `label`, `color`, `sortOrder`.

Ao excluir um status ou categoria, os controllers desvinculam as tarefas afetadas
(`Todo.updateMany(..., { status/category: null })`) antes de responder.

### Frontend

```text
frontend/src/
├── main.js                # Bootstrap Vue + Vuetify + Router
├── App.vue                # Shell da aplicação (navegação)
├── router/index.js        # Rotas: /painel, /dashboard, /categorias, /status
├── views/                 # PainelView, DashboardView, CategoriasView, StatusView
├── components/            # TaskCard, TaskComposer, StateSelect, CategorySelect, etc.
├── stores/catalog.js      # Estado compartilhado de status/categorias
├── services/api.js        # Cliente Axios (todos, statuses, categories)
├── plugins/               # vuetify.js, reveal.js (diretiva de animação)
├── utils/states.js        # Helpers (ex.: fmtDate)
└── styles/app.css         # Design tokens (CSS variables) e estilos globais
```

O consumo da API passa por `services/api.js`; não faça chamadas `axios` soltas nos
componentes.

## Rotas da API

Prefixo base: `/api`.

- `GET/POST /api/todos`, `PATCH/DELETE /api/todos/:id`
- `GET/POST /api/statuses`, `PATCH/DELETE /api/statuses/:id`
- `GET/POST /api/categories`, `PATCH/DELETE /api/categories/:id`
- `GET /api-docs` — documentação Swagger.

Rotas ausentes caem no `notFound` (404). Cada router é montado com paths de
segmento único (`router.post('/')`), sem duplicar o prefixo.

## Comandos

**Pré-requisitos:** Docker, Docker Compose e [`just`](https://just.systems/)
(recomendado para os comandos abaixo).

A app roda em Docker Compose (MongoDB + backend + frontend). O runner `just`
encapsula o ciclo de vida do Docker; execute a partir da raiz do repositório:

```bash
just help
```

```bash
just create
```

```bash
just start
```

```bash
just stop
```

`just create` executa `docker compose up --build --force-recreate`; `just start`
executa em segundo plano (`up -d`); `just stop` derruba os serviços e remove os
volumes (`down -v`).

Scripts npm do **backend** (executados dentro de `backend/`):

```bash
npm run dev
```

```bash
npm start
```

```bash
npm run swagger
```

```bash
npm test
```

`dev` regenera o Swagger e roda o `nodemon`; `start` roda `node server.js`;
`swagger` regenera o `swagger-output.json`; `test` roda o Jest (Supertest +
`mongodb-memory-server`, sem precisar de um Mongo real). **Regenere o Swagger após
alterar um model ou uma rota.**

Scripts npm do **frontend** (dentro de `frontend/`): `npm run dev` (Vite com
`--host`), `npm run build`, `npm run preview`.

**CI:** `.github/workflows/ci.yml` roda em push/PR para `main` — instala deps,
gera o Swagger, roda os testes do backend e faz o build das imagens Docker de
backend e frontend. Mantenha testes e build passando.

**URLs (após subir os serviços):**

- Backend (API): <http://localhost:3000> — docs Swagger em `/api-docs`.
- Frontend: <http://localhost:5173> (porta padrão do Vite).

## Variáveis de ambiente

A configuração vem de um **`.env` único na raiz** (veja `.env.example`). Todo
serviço recebe suas variáveis a partir dele, injetadas pelo `docker-compose.yml`.
Nunca faça commit de um `.env` real.

- `NODE_PORT` — porta em que a API escuta (o `server.js` lê `NODE_PORT`, com
  fallback para `PORT`; o Compose injeta ambos).
- `FRONTEND_PORT` — porta do Vite (o frontend recebe `VITE_API_URL` apontando para
  o backend).
- `MONGO_URI` — string de conexão do Mongoose (montada pelo `docker-compose.yml`
  a partir dos valores `DATA_BASE_*`).
- `DATA_BASE_USER`, `DATA_BASE_PASSWORD`, `DATA_BASE_NAME`, `DATA_BASE_PORT` —
  credenciais/nome do MongoDB usados pelo Compose.

## Convenções de código

- **Backend — módulos:** CommonJS (`require` / `module.exports`). Não misture com
  ESM. **Frontend:** ESM (`import`/`export`), como é padrão em projetos Vite/Vue.
- **Formatação:** siga o `.editorconfig` — **tabs**, tamanho 4, para JS;
  **espaços**, tamanho 2, para YAML.
- **Nomenclatura:** models em `PascalCase` (`TodoModel.js`), o resto do backend em
  `camelCase` (`todoController.js`, `todoRoutes.js`); componentes Vue em
  `PascalCase` (`TaskCard.vue`).
- **Async:** use `async/await`. Nos controllers, envolva a lógica em `try/catch` e
  encaminhe erros com `next(error)` para o handler central.
- **Camadas:** uma responsabilidade por arquivo — routers mapeiam paths,
  controllers guardam a lógica, models definem schema + validação.
- **Sem comentários:** não deixe comentários no código. Escreva código
  autoexplicativo (nomes claros, funções pequenas) em vez de explicá-lo com
  comentários.
- **Testes:** ao alterar o backend, atualize/adicione testes em `backend/tests/` e
  garanta que `npm test` passe.

## Boas práticas em Node.js

Padrões já adotados no backend — mantenha-os ao evoluir o código:

1. **Tratamento de erros centralizado** via `middlewares/errorHandler.js`; os
   controllers chamam `next(err)` em vez de duplicar respostas de erro.
2. **Validação de entrada** no controller antes de chegar ao banco (ex.: exigir
   `title`), sem depender apenas do schema.
3. **Códigos HTTP corretos** com `http-status-codes` (`201` em criações, `400`/
   `404`/`422` em erros de cliente, `500` só para falhas inesperadas).
4. **Segredos fora do código** — configuração via `dotenv` + `process.env`.
5. **Desligamento gracioso** — `server.js` trata `SIGTERM`/`SIGINT` e fecha o
   servidor HTTP antes de sair.
6. **Roteamento REST consistente** — routers montados sem duplicar segmentos.

## Pontos de atenção

- **Regenere o Swagger** (`npm run swagger`) sempre que mexer em um model ou rota;
  o CI valida essa geração.
- **Lint/format ainda não configurados** — não há ESLint nem Prettier. Ao
  adicioná-los, alinhe ao `.editorconfig` e conecte aos scripts npm.
- **Frontend sem testes automatizados** — só o backend tem suíte de testes hoje.
- **Seed idempotente** — `config/seed.js` só insere status/categorias se as
  coleções estiverem vazias; para re-semear, limpe as coleções antes.
