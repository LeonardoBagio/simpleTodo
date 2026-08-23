# DESIGN.md — simpleTodo (frontend)

Sistema de design do frontend, derivado do que está construído em `src/`.
Direção: **"Console de foco"** (modo Operate). O ato central e recompensado é
**concluir** uma tarefa.

## Fundamentos

- **Stack:** Vue 3 (`<script setup>`) + Vuetify 3 (sistema de tema, ícones MDI,
  shell `v-app`). Controles com craft (checkbox, filtros, composer) são
  elementos próprios estilizados pelos tokens, não componentes default do
  Material — para atingir a interação-assinatura sem lutar contra os defaults.
- **Fonte:** Manrope (400–800), uma única família, com **algarismos tabulares**
  (`.num`) em contadores, datas e progresso.
- **Cena de uso:** foco/estudo; tema claro e escuro em paridade, escolhido por
  `prefers-color-scheme` e persistido em `localStorage`.

## Tokens

Definidos em `src/styles/app.css`, chaveados por `.v-theme--light` / `.v-theme--dark`.

| Papel | Claro | Escuro |
|---|---|---|
| Acento (ação/seleção) | `#5b5bd6` | `#7d7cf0` |
| Acento forte | `#4a4ac4` | `#9291f4` |
| Sucesso (concluído) | `#1f9d63` | `#34c07d` |
| Perigo (excluir) | `#e0464b` | `#f16b6f` |
| Superfície | `#ffffff` | `#14171f` |
| Texto / 2 / 3 | `#171a21` / `#565d6d` / `#8b92a3` | `#eef1f7` / `#a3abbd` / `#6f7789` |
| Borda / forte | `#e3e6ee` / `#d3d8e4` | `#262b37` / `#333a49` |

Estratégia de cor: **Restrained** (neutros slate + um acento iris). Sucesso e
perigo são semânticos e estreitos, nunca decorativos. Fundo com gradiente radial
sutil no topo. Raio base 16px; `--ease-spring` e `--ease-out` para o movimento.

## Componentes (`src/components`)

- **ProgressHeader** — título, data por extenso, medidor de progresso que sobe
  ao concluir.
- **TodoComposer** — input em pílula elevada; botão de adicionar desabilitado
  quando vazio; estado `busy`.
- **TodoFilters** — controle segmentado (Todas / Pendentes / Concluídas) com
  contadores tabulares.
- **TodoItem** — linha com **checkbox circular (preenchimento em mola)** e
  **título com risco desenhado** (`background-size` animado, não instantâneo);
  ações reveladas no hover, sempre visíveis no toque.
- **EmptyState** — ensina o próximo passo conforme o filtro ativo.

## Estados e movimento

- Carregamento: **skeleton** (não spinner). Erro: banner inline dispensável.
  Vazio, hover, foco por teclado, disabled e `busy` cobertos.
- Atualizações **otimistas** (concluir/excluir/limpar) com reversão em falha.
- Um momento autoral: a conclusão (mola + risco + progresso). Transições de
  lista para entrar/sair/reordenar. `prefers-reduced-motion` respeitado.
- Superfícies do navegador tematizadas: seleção, scrollbar e anel de foco.

## Integração

`src/services/api.js` (Axios) consome `${VITE_API_URL}/api/todos`
(`GET`, `POST`, `PATCH /:id`, `DELETE /:id`).
