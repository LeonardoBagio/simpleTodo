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

# Backups usam a API do backend (mesma engine da tela Backup).
# Requer o backend no ar (just start / just create).
_api := 'http://localhost:' + env_var_or_default('NODE_PORT', '3000') + '/api/backups'

# Destino na nuvem (rclone). Defina RCLONE_REMOTE no .env para mudar.
_rclone_remote := env_var_or_default('RCLONE_REMOTE', 'gdrive:simpletodo-backups')

# 🔑  Configura a criptografia de backup (gera a chave). Rode uma vez.
backup-init:
    #!/usr/bin/env bash
    set -euo pipefail
    printf "{{ _blue }}🔑  Configurando criptografia de backup...{{ _reset }}\n"
    curl -fsS -X POST {{ _api }}/configure > /dev/null
    printf "{{ _green }}✅  Backup configurado (chave em backups/.key, fora do git).{{ _reset }}\n"
    printf "{{ _yellow }}⚠️   GUARDE backups/.key EM LUGAR SEGURO. Sem essa chave é{{ _reset }}\n"
    printf "{{ _yellow }}    impossível restaurar os backups.{{ _reset }}\n"

# 💾  Gera um backup criptografado (AES-256) do MongoDB em backups/
backup:
    #!/usr/bin/env bash
    set -euo pipefail
    printf "{{ _blue }}💾  Gerando backup criptografado...{{ _reset }}\n"
    name=$(curl -fsS -X POST {{ _api }} | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    printf "{{ _green }}✅  Backup salvo: backups/%s{{ _reset }}\n" "$name"

# 📋  Lista os backups disponíveis
backups:
    @curl -fsS {{ _api }}

# ♻️  Restaura um backup (uso: just restore simpletodo-AAAAMMDD-HHMMSS.stbackup)
restore name:
    #!/usr/bin/env bash
    set -euo pipefail
    printf "{{ _yellow }}⚠️   Isto vai SUBSTITUIR os dados atuais do banco pelos do backup.{{ _reset }}\n"
    read -p "Confirma a restauração de {{ name }}? [s/N] " ans
    case "$ans" in
        s|S|sim|Sim) ;;
        *) printf "{{ _blue }}Cancelado.{{ _reset }}\n"; exit 0 ;;
    esac
    printf "{{ _blue }}♻️   Restaurando...{{ _reset }}\n"
    curl -fsS -X POST {{ _api }}/restore -H 'Content-Type: application/json' -d '{"name":"{{ name }}"}' > /dev/null
    printf "{{ _green }}✅  Restauração concluída.{{ _reset }}\n"

# 🔑  Autentica o rclone no Google Drive (uma vez; abre o navegador)
backup-remote-init:
    @printf "{{ _blue }}🔑  Configurando o rclone (siga o assistente; escolha auto config = y)...{{ _reset }}\n"
    docker run --rm -it --network host -v "$PWD/rclone-config:/config/rclone" rclone/rclone config
    @printf "{{ _green }}✅  Se criou o remote 'gdrive', já pode usar: just backup-push{{ _reset }}\n"

# ☁️  Envia os backups (.stbackup) para a nuvem via rclone
backup-push:
    #!/usr/bin/env bash
    set -euo pipefail
    if [ ! -f rclone-config/rclone.conf ]; then
        printf "{{ _yellow }}⚠️   rclone não configurado. Rode antes: just backup-remote-init{{ _reset }}\n"
        exit 1
    fi
    printf "{{ _blue }}☁️   Enviando backups para {{ _rclone_remote }}...{{ _reset }}\n"
    docker compose run --rm rclone copy /data {{ _rclone_remote }} --include "*.stbackup" --progress
    printf "{{ _green }}✅  Envio concluído.{{ _reset }}\n"
