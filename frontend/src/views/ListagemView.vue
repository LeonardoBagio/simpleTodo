<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api from '../services/api';
import { useCatalog } from '../stores/catalog';
import { useFilters } from '../stores/filters';
import { fmtDate } from '../utils/states';
import CategorySelect from '../components/CategorySelect.vue';
import StateSelect from '../components/StateSelect.vue';

const catalog = useCatalog();
const { state: filters } = useFilters();
const todos = ref([]);
const loading = ref(true);
const loaded = ref(false);
const error = ref('');
const busyIds = reactive(new Set());
const editingCell = reactive({ id: null, field: null });
const draft = ref('');

const PERIODS = [
	{ value: 'all', label: 'Tudo' },
	{ value: 30, label: '30D' },
	{ value: 7, label: '7D' },
	{ value: 1, label: '1D' },
];

const DAY = 24 * 60 * 60 * 1000;
const PAGE = 50;

const collapsed = reactive(new Set(['older']));
const expanded = reactive(new Set());

function startOfToday() {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	return d.getTime();
}

const scoped = computed(() => {
	let list = todos.value;
	if (filters.category) {
		list = list.filter((t) => t.category?._id === filters.category);
	}
	if (filters.period !== 'all') {
		const since = Date.now() - filters.period * DAY;
		list = list.filter((t) => new Date(t.updatedAt).getTime() >= since);
	}
	return [...list].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
});

const total = computed(() => scoped.value.length);

const hasFilter = computed(() => filters.period !== 'all' || !!filters.category);

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

function toggleCollapse(key) {
	if (collapsed.has(key)) collapsed.delete(key);
	else collapsed.add(key);
}

function visibleItems(g) {
	return expanded.has(g.key) ? g.items : g.items.slice(0, PAGE);
}

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

function upsert(todo) {
	const i = todos.value.findIndex((t) => t._id === todo._id);
	if (i !== -1) todos.value.splice(i, 1, todo);
}

async function setField(id, patch) {
	busyIds.add(id);
	error.value = '';
	try {
		const updated = await api.todos.update(id, patch);
		upsert(updated);
	} catch (e) {
		error.value = 'Não foi possível atualizar a tarefa.';
	} finally {
		busyIds.delete(id);
	}
}

function focusInput(el) {
	if (el) {
		el.focus();
		el.select();
	}
}

function isEditing(todo, field) {
	return editingCell.id === todo._id && editingCell.field === field;
}

function startEdit(todo, field) {
	editingCell.id = todo._id;
	editingCell.field = field;
	draft.value = field === 'issue' ? todo.issue || '' : todo.title || '';
}

function cancelEdit() {
	editingCell.id = null;
	editingCell.field = null;
	draft.value = '';
}

function commitEdit(todo) {
	if (editingCell.id !== todo._id) return;
	const field = editingCell.field;
	const value = draft.value.trim();
	const original = field === 'issue' ? todo.issue || '' : todo.title || '';
	cancelEdit();
	if (field === 'title' && !value) return;
	if (value === original) return;
	setField(todo._id, { [field]: value });
}

onMounted(load);
</script>

<template>
	<div class="listagem">
		<header class="head">
			<div>
				<h1 class="section-title title">Listagem</h1>
				<span class="divider"></span>
				<p v-if="loaded" class="count-line">
					<span class="num">{{ total }}</span> tarefa(s){{ hasFilter ? ' no filtro' : '' }}
				</p>
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
							:class="{ active: filters.period === p.value }"
							:aria-pressed="filters.period === p.value"
							@click="filters.period = p.value"
						>
							{{ p.label }}
						</button>
					</div>
				</div>
				<div class="filter">
					<span class="eyebrow flabel">Filtrar por categoria</span>
					<CategorySelect v-model="filters.category" all-label="Todas as categorias" />
				</div>
			</div>
		</header>

		<v-expand-transition>
			<div v-if="error" class="banner" role="alert">
				<v-icon icon="mdi-alert-circle-outline" size="18" />
				<span>{{ error }}</span>
				<button class="banner-retry" type="button" @click="load">Tentar novamente</button>
			</div>
		</v-expand-transition>

		<div v-if="loading && !loaded" class="skeleton-wrap card">
			<div v-for="n in 6" :key="n" class="skeleton-row shimmer" />
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
				<button
					class="group-head"
					type="button"
					:aria-expanded="!collapsed.has(g.key)"
					@click="toggleCollapse(g.key)"
				>
					<v-icon :icon="collapsed.has(g.key) ? 'mdi-chevron-right' : 'mdi-chevron-down'" size="18" class="caret" />
					<span class="group-label">{{ g.label }}</span>
					<span class="group-count num">{{ g.items.length }}</span>
				</button>

				<v-expand-transition>
					<div v-show="!collapsed.has(g.key)">
						<div class="table-scroll card">
							<table class="rows">
								<caption class="sr-only">{{ g.label }}</caption>
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
									<tr v-for="t in visibleItems(g)" :key="t._id" class="row" :class="{ busy: busyIds.has(t._id) }">
										<td class="col-when">
											<span class="when num">{{ fmtDate(t.updatedAt) }}</span>
										</td>
										<td class="col-issue">
											<input
												v-if="isEditing(t, 'issue')"
												:ref="focusInput"
												v-model="draft"
												class="cell-input issue-input num"
												type="text"
												aria-label="Editar issue"
												placeholder="—"
												@keydown.enter.prevent="commitEdit(t)"
												@keydown.esc.prevent="cancelEdit"
												@blur="commitEdit(t)"
											/>
											<button
												v-else
												type="button"
												class="cell-edit issue-edit"
												title="Editar issue"
												@click="startEdit(t, 'issue')"
											>
												<span v-if="t.issue" class="issue num">#{{ t.issue }}</span>
												<span v-else class="dash">—</span>
											</button>
										</td>
										<td class="col-task">
											<input
												v-if="isEditing(t, 'title')"
												:ref="focusInput"
												v-model="draft"
												class="cell-input"
												type="text"
												aria-label="Editar tarefa"
												@keydown.enter.prevent="commitEdit(t)"
												@keydown.esc.prevent="cancelEdit"
												@blur="commitEdit(t)"
											/>
											<button
												v-else
												type="button"
												class="cell-edit task-edit"
												:title="t.title"
												@click="startEdit(t, 'title')"
											>
												<span class="task-title" :class="{ done: t.status?.group === 'concluidos' }">
													{{ t.title }}
												</span>
											</button>
										</td>
										<td class="col-cat">
											<CategorySelect
												:model-value="t.category ? t.category._id : null"
												all-label="Sem categoria"
												@update:model-value="(id) => setField(t._id, { category: id })"
											/>
										</td>
										<td class="col-state">
											<StateSelect
												:model-value="t.status ? t.status._id : null"
												all-label="Sem Andamento"
												placeholder="Sem Andamento"
												@update:model-value="(id) => setField(t._id, { status: id })"
											/>
										</td>
									</tr>
								</tbody>
							</table>
						</div>

						<div v-if="g.items.length > PAGE && !expanded.has(g.key)" class="load-more-wrap">
							<button class="load-more" type="button" @click="expanded.add(g.key)">
								Mostrar mais <span class="num">{{ g.items.length - PAGE }}</span> restantes
							</button>
						</div>
					</div>
				</v-expand-transition>
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

.count-line {
	margin: 10px 0 0;
	font-size: var(--fs-sm);
	color: var(--text-muted-on-light);
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

.groups {
	display: flex;
	flex-direction: column;
	gap: 22px;
}

.group-head {
	display: flex;
	align-items: center;
	gap: 10px;
	background: transparent;
	border: 0;
	cursor: pointer;
	padding: 4px 2px;
	margin-bottom: 12px;
	width: 100%;
}

.caret {
	color: var(--text-muted-on-light);
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
	overflow: auto;
	max-height: 70vh;
	overscroll-behavior: contain;
}

.rows {
	width: 100%;
	min-width: 720px;
	table-layout: fixed;
	border-collapse: collapse;
	font-size: var(--fs-sm);
}

.rows thead th {
	position: sticky;
	top: 0;
	z-index: 1;
	background: var(--surface);
	text-align: left;
	white-space: nowrap;
	padding: 12px 14px;
	font-family: var(--font-head);
	font-weight: 700;
	font-size: 9px;
	letter-spacing: 0.14em;
	text-transform: uppercase;
	color: var(--text-muted-on-light);
	box-shadow: inset 0 -1px 0 var(--border-subtle);
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

.row.busy td {
	opacity: 0.5;
	pointer-events: none;
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

.cell-edit {
	display: block;
	width: 100%;
	text-align: left;
	background: transparent;
	border: 1px solid transparent;
	border-radius: var(--radius-sm);
	padding: 5px 7px;
	cursor: text;
	transition: background 0.14s var(--ease), border-color 0.14s var(--ease);
}

.cell-edit:hover {
	background: var(--surface);
	border-color: var(--border-strong);
}

.cell-edit:focus-visible {
	outline: none;
	background: var(--surface);
	border-color: var(--color-ink);
}

.issue-edit {
	display: inline-flex;
	width: auto;
}

.cell-input {
	width: 100%;
	box-sizing: border-box;
	background: var(--surface);
	border: 1px solid var(--color-ink);
	border-radius: var(--radius-sm);
	padding: 5px 7px;
	font-family: var(--font-head);
	font-weight: 700;
	font-size: 14px;
	letter-spacing: -0.01em;
	color: var(--color-ink);
	outline: none;
}

.issue-input {
	font-size: 12px;
}

.load-more-wrap {
	display: flex;
	justify-content: center;
	margin-top: 12px;
}

.load-more {
	border: 1px solid var(--border-strong);
	background: var(--surface);
	border-radius: var(--radius-pill);
	padding: 0.45rem 1.1rem;
	font-family: var(--font-head);
	font-weight: 700;
	font-size: var(--fs-xs);
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: var(--color-ink);
	cursor: pointer;
	transition: background 0.2s var(--ease), color 0.2s var(--ease);
}

.load-more:hover {
	background: var(--primary-accent);
	color: var(--text-on-accent);
}

.sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
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
</style>
