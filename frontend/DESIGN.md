# DESIGN.md — simpleTodo (frontend)

Sistema de design do frontend, **portado do `simpleTodo_fastAPI`** (design
language do portfólio, `portifolio_html/design.md`). Paleta monocromática
(preto / branco / cinzas), tipografia fluida com Montserrat + Raleway, header e
footer escuros fixos com conteúdo claro entre eles, cards brancos com elevação
suave, badges pill e animação de entrada. A única cor vem das **lâmpadas de
estado**, tratadas como accent funcional — do mesmo modo que o portfólio só
colore ícones de marca.

## Fundamentos

- **Stack:** Vue 3 (`<script setup>`) + Vuetify 3 (shell `v-app`, ícones MDI).
  Os controles com craft (composer, filtros, cards) são elementos próprios
  estilizados pelos tokens em `src/styles/app.css`, não componentes default do
  Material.
- **Fontes:** self-hosted via `@fontsource` (sem CDN). **Montserrat**
  (`--font-head`, 400/700/900) em títulos, rótulos, botões, badges e leituras
  numéricas — caixa alta + tracking. **Raleway** (`--font-body`, 400/600/700)
  no texto corrido. Numerais tabulares (`tnum` / `.num`) em contagens e datas.
- **Tema:** **light-only** (`color-scheme: light`), como o portfólio.

## Paleta

Monocromática. Use sempre os aliases semânticos (tokens em `src/styles/app.css`).

| Token | Valor | Uso |
|---|---|---|
| `--color-ink` | `#1a1a1a` | texto primário + accent escuro (botões primários, mark) |
| `--color-cloud` | `#e5e5e5` | fundo da página |
| `--surface` | `#ffffff` | cards / superfícies elevadas |
| `--text-muted-on-light` | `#5c5c5c` | texto secundário sobre fundo claro (AA) |
| `--color-mist` | `#999999` | cinza decorativo (divisores, scrollbar) |

**Lâmpadas de estado** (único accent cromático — carrega significado):

| Estado | Token | Cor |
|---|---|---|
| Standby | `--lamp-draft` | `#7a8593` cinza |
| Pendente / na fila | `--lamp-todo` | `#4a9fd4` azul |
| Em operação | `--lamp-doing` | `#f2a41c` âmbar (pulsante) |
| Concluída | `--lamp-done` | `#4bbd6b` verde |
| Descartada | `--lamp-trash` | `#df5140` vermelho |

## Componentes de estilo (`src/styles/app.css`)

- `.card` / `.plate` — superfície branca, `--radius-md`, borda sutil,
  `--shadow-sm`. `.card-lift` adiciona a elevação de hover
  (`translateY(-6px)` + `--shadow-lg`) dos cards de projeto do portfólio.
- `.section-title` + `.divider` — cabeçalho de seção (Montserrat black caixa
  alta) com o traço-acento curto.
- `.pill` + `.dot` — badge neutro com ponto colorido de estado.
- `.btn` / `.btn-primary` (ink sólido) / `.btn-outline` (contorno).
- `.field` — input claro com foco em ink.
- `.reveal` → `.is-visible` — animação de entrada via diretiva `v-reveal`
  (`src/plugins/reveal.js`; IntersectionObserver com fallback e reduced-motion).

## Componentes Vue (`src/components`)

- **Wordmark** — mark monocromático (tile ink/branco + medidor), prop `tone`
  (`dark` no header/footer) e `compact`.
- **StateLamp** — ponto de estado genérico por **cor** (props `color`, `pulse`).
- **ProgressHeader** — cabeçalho de seção: título + divider + contagens +
  barra de progresso monocromática (ink).
- **TodoComposer** — card com `field` + `btn-primary` (ink) para criar tarefa.
- **TodoFilters** — filtro estilo *ribbon*: chips com lâmpada + rótulo +
  contagem (Todas / Pendentes / Concluídas).
- **TodoItem** — card de tarefa estilo projeto: pill de estado clicável
  (lâmpada + label), título Montserrat caixa alta (riscado + verde quando
  concluída), data da criação e ações rápidas (concluir / excluir com
  confirmação).
- **EmptyState** — card centrado com divider + section-title conforme o filtro.

## Layout & ordem

- Header e footer escuros (fixos), conteúdo claro entre eles — padrão do
  portfólio. `max-width` 1120px.
- Grid do board: `auto-fill` + `minmax(280px, 1fr)`, gap `--space-5`.
- Mais recentes primeiro (a API retorna ordenado por criação desc).

## Acessibilidade & movimento

- Foco visível em ink (`:focus-visible`), contraste AA para texto secundário
  (`--text-muted-on-light`).
- Superfícies do navegador temáticas: seleção, scrollbar, caret.
- Tudo colapsa sob `prefers-reduced-motion: reduce` (reveal, pulso, transições).

## Integração

`src/services/api.js` (Axios) consome `${VITE_API_URL}/api/todos`
(`GET`, `POST`, `PATCH /:id`, `DELETE /:id`).
