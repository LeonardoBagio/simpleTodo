# CLAUDE.md

Orientações para o Claude Code (e para pessoas contribuidoras) ao trabalhar
neste repositório. Documenta o projeto e as convenções Node.js a seguir.

## Objetivo do projeto

`simpleTodo` é um **laboratório prático de desenvolvimento Fullstack focado em
simplicidade e performance**. É um ambiente de estudos que implementa um gestor de
tarefas (To-Do List) com a stack MEVN (MongoDB, Express, Vue, Node.js), rodando
inteiramente em Docker com **multi-stage builds**. Por ser um laboratório, ele
dispensa complexidades como tabelas de usuários e foca no fluxo principal de
dados.

Funcionalidades pretendidas (ver README):

- Criar novas tarefas.
- Listar todas as tarefas cadastradas (mais recentes primeiro).
- Marcar tarefas como concluídas ou pendentes.
- Excluir tarefas do banco de dados.

> Estado atual do código: o backend implementa apenas **listar** (`GET`) e
> **criar** (`POST`). Marcar como concluída/pendente e excluir ainda **não estão
> implementados**, apesar de descritos no README. Ao adicionar essas rotas, siga
> as boas práticas abaixo.

## Visão geral do projeto

Stack MEVN em monorepo, orquestrada com Docker Compose:

- **Backend** — Node.js, Express, Mongoose (serviço ativo).
- **Frontend (planejado)** — Vue.js 3 (via Vite), Vuetify (Material Design) e
  Axios para o consumo da API.
- **Banco de dados** — MongoDB.
- **Infraestrutura** — Docker + Docker Compose com multi-stage builds e hot-reload
  via espelhamento de volumes.

Estrutura do monorepo:

- **`backend/`** — o serviço ativo: Node.js + Express + Mongoose sobre MongoDB.
- **`frontend/`** — apenas um placeholder (um `Dockerfile`, sem código-fonte
  ainda). Seu serviço está atualmente comentado no `docker-compose.yml`. Trate o
  frontend como **ainda não implementado**. Quando for implementado, o README
  prevê a estrutura Vue: `assets/`, `components/` (ex.: `TodoItem`, `TodoForm`),
  `plugins/` (Vuetify), `services/` (Axios), `views/`, `App.vue` e `main.js`.

## Arquitetura

O backend segue um layout em camadas no estilo MVC. Mantenha cada
responsabilidade em sua própria camada.

```text
backend/
├── server.js              # Entrada da app: wiring de middlewares + listen()
├── config/dataBase.js     # Conexão com o MongoDB (Mongoose)
├── models/                # Schemas do Mongoose (formato dos dados + validação)
├── controllers/           # Handlers de requisição / lógica de negócio
├── routes/                # Routers do Express → mapeamento para controllers
├── swagger.js             # Gera swagger-output.json a partir dos models
└── swagger-output.json    # Doc OpenAPI gerado, servido em /api-docs
```

Fluxo da requisição: `routes/` → `controllers/` → `models/`. Não coloque queries
de banco nas rotas nem lógica HTTP nos models.

## Comandos

**Pré-requisitos:** Docker, Docker Compose e [`just`](https://just.systems/)
(recomendado para os comandos abaixo).

A app roda em Docker Compose (MongoDB + backend). O runner `just` encapsula o
ciclo de vida do Docker; execute estes comandos a partir da raiz do repositório:

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

Scripts npm do backend (executados dentro de `backend/`, normalmente invocados
pelo container):

```bash
npm run dev
```

```bash
npm start
```

```bash
npm run swagger
```

`dev` regenera o Swagger e roda o `nodemon`; `start` roda `node server.js`;
`swagger` regenera o `swagger-output.json`. Regenere o Swagger após alterar um
model ou uma rota.

**URLs (após subir os serviços):**

- Backend (API): <http://localhost:3000> — docs Swagger em `/api-docs`.
- Frontend (quando implementado): <http://localhost:5173> (porta padrão do Vite).

## Variáveis de ambiente

A configuração vem de um **`.env` único na raiz** (veja `.env.example`). Todo
serviço recebe suas variáveis a partir dele, injetadas pelo `docker-compose.yml`.
Nunca faça commit de um `.env` real.

- `NODE_PORT` — porta em que a API escuta (lida via `process.env.NODE_PORT`).
- `MONGO_URI` — string de conexão do Mongoose (montada pelo `docker-compose.yml`
  a partir dos valores `DATA_BASE_*` abaixo).
- `DATA_BASE_USER`, `DATA_BASE_PASSWORD`, `DATA_BASE_NAME`, `DATA_BASE_PORT` —
  credenciais/nome do MongoDB usados pelo Compose.

> Mantenha a variável de porta alinhada: o `server.js` lê `NODE_PORT`, enquanto o
> `docker-compose.yml` também injeta `PORT`. Ao mexer em qualquer um dos dois,
> deixe-os consistentes para que o container e a app concordem.

## Convenções de código

- **Módulos:** CommonJS (`require` / `module.exports`). Seja consistente — não
  misture com `import`/`export` do ESM.
- **Formatação:** siga o `.editorconfig` — **tabs**, tamanho 4, para JS;
  **espaços**, tamanho 2, para YAML. Alguns arquivos existentes misturam tabs e
  espaços; normalize para tabs em qualquer arquivo que você editar.
- **Nomenclatura:** models em `PascalCase` (`TodoModel.js`), o resto em
  `camelCase` (`todoController.js`, `todoRoutes.js`).
- **Async:** use `async/await`. Todo `await` que pode lançar erro deve estar em um
  `try/catch` (ou ser tratado por middleware central de erros — veja abaixo).
- **Camadas:** uma responsabilidade por arquivo — routers mapeiam paths,
  controllers guardam a lógica, models definem schema + validação.
- **Sem comentários:** não deixe comentários no código. Escreva código
  autoexplicativo (nomes claros, funções pequenas) em vez de explicá-lo com
  comentários.

## Boas práticas em Node.js

Siga estas orientações ao adicionar ou alterar código do backend:

1. **Centralize o tratamento de erros.** Prefira um único middleware de tratamento
   de erros do Express (`app.use((err, req, res, next) => …)`) com os controllers
   chamando `next(err)`, em vez de copiar e colar `try/catch` + respostas JSON em
   cada handler. Isso evita desvios como reutilizar a mensagem de erro errada.
2. **Valide a entrada** antes que ela chegue ao banco — verifique campos
   obrigatórios e tipos no controller (ou em um middleware de validação), não
   dependa apenas do schema para rejeitar requisições inválidas.
3. **Use os códigos HTTP corretos.** O pacote `http-status-codes` já é uma
   dependência — use-o: `201 CREATED` para criações bem-sucedidas,
   `400`/`404`/`422` para erros do cliente, `500` apenas para falhas inesperadas.
4. **Mantenha segredos fora do código.** Carregue configuração via `dotenv` +
   `process.env`; nunca deixe credenciais ou strings de conexão hardcoded.
5. **Mantenha as dependências limpas.** Remova pacotes que você não usa. Nota:
   `pg` e `pg-hstore` (PostgreSQL) estão listados, mas a app usa MongoDB —
   remova-os, a menos que o Postgres seja de fato adotado.
6. **Endureça a camada HTTP.** Adicione `helmet`, restrinja o `cors` a origens
   conhecidas em vez do padrão totalmente aberto, e adicione logging de
   requisições (ex.: `morgan`/`pino`).
7. **Desligue com elegância.** Trate `SIGTERM`/`SIGINT` para fechar o servidor HTTP
   e a conexão do Mongoose antes de sair, liberando de forma limpa as requisições
   em andamento e os handles do banco.
8. **Consistência no roteamento REST.** Monte os routers e defina os paths de forma
   que os segmentos não fiquem duplicados (ex.: um router montado em `/todo` deve
   usar `router.post('/', …)`, não `/todo`, para evitar `/todo/todo`). Mantenha os
   paths documentados no README em sincronia com as rotas reais.
9. **Adicione lint / format / testes.** Atualmente não há ESLint, Prettier nem
   runner de testes. Quando for viável, adicione ESLint + Prettier (alinhados ao
   `.editorconfig`) e um setup de testes (ex.: Jest ou Vitest + Supertest para a
   API), e conecte-os aos scripts npm.

## Problemas conhecidos / convenções a manter

Ao mexer nestas áreas, corrija ou alinhe em vez de copiar o padrão existente:

- **Divergência de variável de porta:** o `server.js` usa `NODE_PORT`; o Compose
  injeta `PORT`.
- **Dependências não usadas:** `pg`, `pg-hstore` não são usados (a app é MongoDB).
- **Path da rota:** `todoRoutes.js` monta em `/todo` e declara `POST /todo`,
  produzindo `POST /todo/todo`; o README documenta `/api/todos`. Reconcilie-os.
- **Mensagem de erro copiada:** o controller `create` reutiliza a mensagem
  "Error retrieving all". Dê a cada handler uma mensagem precisa.
- **Camadas ausentes:** ainda não há middleware central de erros, validação de
  entrada nem desligamento gracioso — adicione conforme a seção de boas práticas
  acima.
- **Estrutura vs. README:** o README descreve um diretório `backend/src/`, mas os
  arquivos estão diretamente em `backend/` (sem `src/`). Ao referenciar a
  estrutura, use o layout real documentado na seção Arquitetura.
- **Funcionalidades descritas mas não implementadas:** marcar como
  concluída/pendente e excluir tarefas constam no README, mas não existem no
  backend. As rotas reais são apenas `GET /` e `POST` (ver divergência de path
  acima).
