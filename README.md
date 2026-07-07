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