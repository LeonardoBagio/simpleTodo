<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import { useCatalog } from '../stores/catalog';
import { fmtDate } from '../utils/states';
import CategorySelect from '../components/CategorySelect.vue';
import StatusBadge from '../components/StatusBadge.vue';

const catalog = useCatalog();
const todos = ref([]);
const loading = ref(true);
const loaded = ref(false);
const error = ref('');
const categoryFilter = ref(null);
const periodFilter = ref('all');

const PERIODS = [
	{ value: 'all', label: 'All' },
	{ value: 30, label: '30D' },
	{ value: 7, label: '7D' },
	{ value: 1, label: '1D' },
];

const DAY = 24 * 60 * 60 * 1000;

function startOfToday() {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	return d.getTime();
}

const scoped = computed(() => {
	let list = todos.value;
	if (categoryFilter.value) {
		list = list.filter((t) => t.category?._id === categoryFilter.value);
	}
	if (periodFilter.value !== 'all') {
		const since = Date.now() - periodFilter.value * DAY;
		list = list.filter((t) => new Date(t.updatedAt).getTime() >= since);
	}
	return [...list].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
});

const total = computed(() => scoped.value.length);

const groups = computed(() => {
	const today = startOfToday();
	const defs = [
		{ key: 'hoje', label: 'Hoje', from: today },
		{ key: 'ontem', label: 'Ontem', from: today - DAY },
		{ key: '7d', label: 'Últimos 7 dias', from: today - 7 * DAY },
		{ key: '30d', label: 'Últimos 30 dias', from: today - 30 * DAY },
		{ key: 'older', label: 'Mais antigas', from: -Infinity },
	];
	const buckets = defs.map((d) => ({ ...d, items: [] }));
	for (const t of scoped.value) {
		const ts = new Date(t.updatedAt).getTime();
		const bucket = buckets.find((b) => ts >= b.from);
		bucket.items.push(t);
	}
	return buckets.filter((b) => b.items.length);
});

async function load() {
	loading.value = true;
	error.value = '';
	try {
		await catalog.fetchAll();
		todos.value = await api.todos.getAll({ includeDone: true });
		loaded.value = true;
	} catch (e) {
		error.value = 'Não foi possível carregar a listagem de tarefas.';
	} finally {
		loading.value = false;
	}
}

onMounted(load);
</script>

<template>
	<div class="listagem">
		<header class="head">
			<div>
				<h1 class="section-title title">Listagem</h1>
				<span class="divider"></span>
			</div>
			<div class="filters">
				<div class="filter">
					<span class="eyebrow flabel">Período</span>
					<div class="segment" role="group" aria-label="Filtrar por período">
						<button
							v-for="p in PERIODS"
							:key="p.value"
							type="button"
							class="seg-btn"
							:class="{ active: periodFilter === p.value }"
							:aria-pressed="periodFilter === p.value"
							@click="periodFilter = p.value"
						>
							{{ p.label }}
						</button>
					</div>
				</div>
				<div class="filter">
					<span class="eyebrow flabel">Filtrar por categoria</span>
					<CategorySelect v-model="categoryFilter" all-label="Todas as categorias" />
				</div>
			</div>
		</header>

		<div v-if="error" class="banner" role="alert">{{ error }}</div>

		<div v-if="loading && !loaded" class="skeleton-wrap card">
			<div v-for="n in 6" :key="n" class="skeleton-row" />
		</div>

		<div v-else-if="groups.length === 0" class="empty card">
			<span class="divider"></span>
			<h3 class="section-title etitle">{{ todos.length === 0 ? 'Sem tarefas ainda' : 'Nada no filtro' }}</h3>
			<p class="etext">
				{{ todos.length === 0 ? 'Cadastre tarefas no Painel para vê-las aqui.' : 'Ajuste o período ou o filtro de categoria.' }}
			</p>
		</div>

		<section v-else class="groups">
			<div v-for="g in groups" :key="g.key" class="group">
				<div class="group-head">
					<span class="group-label">{{ g.label }}</span>
					<span class="group-count num">{{ g.items.length }}</span>
				</div>

				<div class="table-scroll card">
					<table class="rows">
						<thead>
							<tr>
								<th class="col-when">
									<v-icon icon="mdi-clock-outline" size="14" /> Última edição
								</th>
								<th class="col-issue">
									<v-icon icon="mdi-github" size="14" /> Issue
								</th>
								<th class="col-task">
									<v-icon icon="mdi-format-list-checks" size="14" /> Tarefa
								</th>
								<th class="col-cat">
									<v-icon icon="mdi-tag-outline" size="14" /> Categoria
								</th>
								<th class="col-state">
									<v-icon icon="mdi-progress-check" size="14" /> Andamento
								</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="t in g.items" :key="t._id" class="row">
								<td class="col-when">
									<span class="when num">{{ fmtDate(t.updatedAt) }}</span>
								</td>
								<td class="col-issue">
									<span v-if="t.issue" class="issue num">#{{ t.issue }}</span>
									<span v-else class="dash">—</span>
								</td>
								<td class="col-task">
									<span class="task-title" :class="{ done: t.status?.group === 'concluidos' }" :title="t.title">
										{{ t.title }}
									</span>
								</td>
								<td class="col-cat">
									<span
										v-if="t.category"
										class="cat-badge"
										:style="{ background: t.category.color }"
									>
										{{ t.category.label }}
									</span>
									<span v-else class="muted-badge">Sem categoria</span>
								</td>
								<td class="col-state">
									<StatusBadge :status="t.status" />
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</section>
	</div>
</template>

<style scoped>
.listagem {
	display: flex;
	flex-direction: column;
	gap: 26px;
}

.head {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 16px;
	flex-wrap: wrap;
}

.title {
	font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.2rem);
}

.filters {
	display: flex;
	align-items: flex-end;
	gap: 16px;
	flex-wrap: wrap;
}

.filter {
	display: flex;
	flex-direction: column;
	gap: 6px;
	align-items: flex-start;
}

.segment {
	display: inline-flex;
	background: var(--surface);
	border: 1px solid var(--border-strong);
	border-radius: var(--radius-pill);
	padding: 2px;
	gap: 2px;
}

.seg-btn {
	border: none;
	background: transparent;
	border-radius: var(--radius-pill);
	padding: 0.3rem 0.7rem;
	font-family: var(--font-head);
	font-weight: 700;
	font-size: var(--fs-xs);
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: var(--text-muted-on-light);
	cursor: pointer;
	transition: background 0.2s var(--ease), color 0.2s var(--ease);
}

.seg-btn:hover:not(.active) {
	color: var(--color-ink);
}

.seg-btn.active {
	background: var(--color-ink);
	color: #fff;
}

.flabel {
	font-size: 9px;
	color: var(--text-muted-on-light);
}

.groups {
	display: flex;
	flex-direction: column;
	gap: 22px;
}

.group-head {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 4px 2px;
	margin-bottom: 12px;
}

.group-label {
	font-family: var(--font-head);
	font-weight: 900;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	font-size: var(--fs-sm);
	color: var(--color-ink);
}

.group-count {
	font-family: var(--font-head);
	font-weight: 700;
	font-size: 12px;
	color: var(--text-muted-on-light);
}

.table-scroll {
	overflow-x: auto;
	padding: 4px;
}

.rows {
	width: 100%;
	min-width: 720px;
	table-layout: fixed;
	border-collapse: collapse;
	font-size: var(--fs-sm);
}

.rows thead th {
	text-align: left;
	white-space: nowrap;
	padding: 12px 14px;
	font-family: var(--font-head);
	font-weight: 700;
	font-size: 9px;
	letter-spacing: 0.14em;
	text-transform: uppercase;
	color: var(--text-muted-on-light);
	border-bottom: 1px solid var(--border-subtle);
}

.rows thead th .v-icon {
	color: var(--color-mist);
	margin-right: 4px;
	vertical-align: -2px;
}

.rows tbody td {
	padding: 12px 14px;
	border-bottom: 1px solid var(--border-subtle);
	vertical-align: middle;
}

.row:last-child td {
	border-bottom: 0;
}

.row {
	transition: background 0.14s var(--ease);
}

.row:hover td {
	background: var(--bg-light);
}

.col-when {
	width: 150px;
	white-space: nowrap;
}

.col-issue {
	width: 84px;
	white-space: nowrap;
}

.col-cat {
	width: 150px;
}

.col-state {
	width: 210px;
}

.col-task {
	width: auto;
}

.when {
	font-family: var(--font-head);
	font-size: 11px;
	font-weight: 600;
	color: var(--text-muted-on-light);
}

.issue {
	font-family: var(--font-head);
	font-weight: 700;
	font-size: 12px;
	color: var(--color-ink);
}

.dash {
	color: var(--color-mist);
}

.task-title {
	font-family: var(--font-head);
	font-weight: 700;
	font-size: 14px;
	letter-spacing: -0.01em;
	color: var(--color-ink);
	overflow-wrap: anywhere;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.task-title.done {
	color: var(--text-muted-on-light);
	text-decoration: line-through;
	text-decoration-color: color-mix(in srgb, var(--lamp-done) 70%, transparent);
}

.cat-badge {
	display: inline-flex;
	align-items: center;
	max-width: 100%;
	border-radius: var(--radius-pill);
	padding: 0.28rem 0.7rem;
	font-family: var(--font-head);
	font-weight: 700;
	font-size: var(--fs-xs);
	line-height: 1.25;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: #fff;
	overflow-wrap: anywhere;
}

.muted-badge {
	font-family: var(--font-head);
	font-weight: 700;
	font-size: var(--fs-xs);
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: var(--text-muted-on-light);
}

.skeleton-wrap {
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 16px;
}

.skeleton-row {
	height: 44px;
	border-radius: var(--radius-sm);
	background: linear-gradient(90deg, rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.06) 50%, rgba(0, 0, 0, 0.03));
	background-size: 200% 100%;
	animation: shimmer 1.3s ease-in-out infinite;
}

@keyframes shimmer {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}

.empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
	padding: 56px 24px;
	text-align: center;
}

.etitle {
	font-size: var(--fs-lg);
}

.etext {
	max-width: 22rem;
	color: var(--text-muted-on-light);
	font-size: var(--fs-sm);
	margin: 0;
}

.banner {
	background: color-mix(in srgb, var(--lamp-trash) 10%, var(--surface));
	color: var(--lamp-trash);
	border: 1px solid color-mix(in srgb, var(--lamp-trash) 30%, transparent);
	border-radius: var(--radius-sm);
	padding: 12px 14px;
	font-size: var(--fs-sm);
	font-weight: 600;
}

@media (prefers-reduced-motion: reduce) {
	.skeleton-row {
		animation: none;
	}
}
</style>
