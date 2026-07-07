# 📝 Gestor de Tarefas Fullstack (MEVN Stack)

Um laboratório prático de desenvolvimento Fullstack focado em simplicidade e performance. Este projeto implementa um To-Do List (Gestor de Tarefas) utilizando a stack MEVN (MongoDB, Express, Vue.js e Node.js) e foi projetado com uma infraestrutura moderna rodando inteiramente em **Docker** com suporte a **Multi-stage builds**.

---

## 🛠 Tecnologias Utilizadas

* **Backend:** Node.js, Express, Mongoose
* **Frontend:** Vue.js 3 (via Vite), Vuetify (Material Design), Axios
* **Banco de Dados:** MongoDB
* **Infraestrutura:** Docker, Docker Compose

---

## 📂 Arquitetura e Estrutura do Projeto

O projeto adota a arquitetura de **Monorepo**, isolando claramente as responsabilidades entre Frontend e Backend, orquestrados pelo Docker Compose.

```text
meu-todo-app/
│
├── docker-compose.yml       # Orquestra o Banco, Backend e Frontend
│
├── backend/                 # 🟢 NODE.JS + EXPRESS + MONGOOSE
│   ├── .env                 # Variáveis de ambiente (PORT, MONGO_URI)
│   ├── package.json
│   ├── Dockerfile           # Multi-stage build para a API
│   └── src/
│       ├── config/          # Configurações gerais (Conexão MongoDB)
│       ├── models/          # Modelos de dados (Schemas Mongoose)
│       ├── controllers/     # Lógica de negócio (Ações das rotas)
│       ├── routes/          # Definição dos Endpoints da API
│       └── server.js        # Ponto de entrada do backend
│
└── frontend/                # 🔵 VUE.JS + VUETIFY
    ├── package.json
    ├── vite.config.js       # Configuração do empacotador
    ├── Dockerfile           # Multi-stage build para a interface
    ├── index.html
    └── src/
        ├── assets/          # Arquivos estáticos
        ├── components/      # Componentes isolados (TodoItem, TodoForm)
        ├── plugins/         # Configurações externas (Vuetify)
        ├── services/        # Comunicação HTTP com a API (Axios)
        ├── views/           # Páginas completas da aplicação
        ├── App.vue          # Componente raiz
        └── main.js          # Ponto de entrada do Vue
```

## ✨ Funcionalidades do Laboratório

Este projeto foi construído como um ambiente de estudos e laboratório, dispensando tabelas complexas de usuários para focar no fluxo principal de dados:

* Criar novas tarefas.
* Listar todas as tarefas cadastradas (mais recentes primeiro).
* Marcar tarefas como concluídas ou pendentes.
* Excluir tarefas do banco de dados.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
* **Docker** e **Docker Compose**
* **[Just](https://just.systems/)** (Recomendado para facilitar a execução dos comandos)

### Passos para Inicialização

**1. Clone o repositório**
```bash
git clone [https://github.com/SEU_USUARIO/meu-todo-app.git](https://github.com/SEU_USUARIO/meu-todo-app.git)
cd meu-todo-app
```

### 2. Gerencie o Ambiente com o Just

O projeto conta com um `justfile` configurado para automatizar o ciclo de vida dos containers. Utilize os comandos abaixo na raiz do projeto:

*   **Para listar os comandos disponíveis:**
    ```bash
    just help
    ```

*   **Para construir e criar o ambiente (recreação forçada):**
    ```bash
    just create
    ```
    *(Nota: O comando executa por baixo dos panos `docker compose up --build --force-recreate`)*

*   **Para iniciar os serviços em segundo plano (Modo Detached):**
    ```bash
    just start
    ```

*   **Para parar os serviços e limpar os volumes (Limpeza total):**
    ```bash
    just stop
    ```

### 3. Acesse a Aplicação

Após iniciar os serviços, acesse:

*   **Frontend (Interface):** [http://localhost:5173](http://localhost:5173)
*   **Backend (API):** [http://localhost:3000/api/todos](http://localhost:3000/api/todos)

---

## 🧠 Detalhes de Infraestrutura (Docker)

Ambos os serviços (Backend e Frontend) utilizam **Multi-stage builds** em seus `Dockerfiles`. 

O ambiente de desenvolvimento atualiza o código em tempo real (*Hot-Reload*) através do espelhamento de volumes (`volumes: - .:/usr/src/app`), permitindo editar os arquivos no sistema host com reflexo imediato nos containers.