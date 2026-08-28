# ┌─────────────────────────────────────────────────────────────┐
# │  Simple Todo — MEVN                                          │
# │  Atalhos para gerenciar os containers Docker (app + banco)  │
# └─────────────────────────────────────────────────────────────┘

# Cores para as mensagens
_green  := '\033[0;32m'
_yellow := '\033[0;33m'
_blue   := '\033[0;34m'
_reset  := '\033[0m'

# Lista as receitas disponíveis (comando padrão)
default:
    @just --list --unsorted

# 🚀  Cria (build) e sobe os containers em segundo plano
# --renew-anon-volumes recria o node_modules (volume anônimo) para o npm install
# do build valer; o volume nomeado do banco (mongo_data) é preservado.
create:
    @printf "{{ _blue }}🚀  Buildando as imagens e subindo os containers...{{ _reset }}\n"
    docker compose up -d --build --renew-anon-volumes
    @printf "{{ _green }}✅  Pronto!{{ _reset }}\n"
    @printf "{{ _green }}    🖥️   Front-end (painel): http://localhost:5173{{ _reset }}\n"
    @printf "{{ _green }}    🔌  API:  http://localhost:3000 (docs em /api-docs){{ _reset }}\n"

# ▶️  Inicia os containers já criados
start:
    @printf "{{ _blue }}▶️   Iniciando os containers...{{ _reset }}\n"
    docker compose start
    @printf "{{ _green }}✅  Containers em execução:{{ _reset }}\n"
    @printf "{{ _green }}    🖥️   Front-end (painel): http://localhost:5173{{ _reset }}\n"
    @printf "{{ _green }}    🔌  API:  http://localhost:3000{{ _reset }}\n"

# ⏹️  Para os containers sem removê-los
stop:
    @printf "{{ _yellow }}⏹️   Parando os containers...{{ _reset }}\n"
    docker compose stop
    @printf "{{ _green }}✅  Containers parados (dados preservados).{{ _reset }}\n"

# 🧹  Remove os containers e a rede (mantém o volume do banco)
down:
    @printf "{{ _yellow }}🧹  Removendo containers e rede...{{ _reset }}\n"
    docker compose down
    @printf "{{ _green }}✅  Ambiente removido (volume do banco preservado).{{ _reset }}\n"

# 📜  Acompanha os logs de um serviço (padrão: backend)
logs service='backend':
    docker compose logs -f {{ service }}

# 📊  Mostra o status dos containers
status:
    docker compose ps

# 🧪  Roda os testes unitários do backend (MongoDB em memória, sem Docker)
test:
    @printf "{{ _blue }}🧪  Rodando os testes unitários do backend...{{ _reset }}\n"
    cd backend && npm test
