<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue';
import api from '../services/api';
import { useCatalog } from '../stores/catalog';
import TaskComposer from '../components/TaskComposer.vue';
import TaskCard from '../components/TaskCard.vue';
import CategorySelect from '../components/CategorySelect.vue';

const catalog = useCatalog();

const todos = ref([]);
const loading = ref(true);
const loaded = ref(false);
const error = ref('');
const saving = ref(false);
const busyIds = reactive(new Set());
const collapsed = reactive(new Set());

const editing = ref(null);
const showComposer = ref(false);
const composerEl = ref(null);

const search = ref('');
const categoryFilter = ref(null);
const showDone = ref(false);
const counts = reactive({ active: 0, done: 0, total: 0 });

const NONE_KEY = 'none';

const isSearching = computed(() => search.value.trim().length > 0);

const filtered = computed(() =>
	todos.value.filter((t) => {
		if (categoryFilter.value && t.category?._id !== categoryFilter.value) return false;
		if (!isSearching.value && !showDone.value && t.status?.group === 'concluidos') return false;
		return true;
	}),
);

const groups = computed(() => {
	const buckets = [];
	const none = filtered.value.filter((t) => !t.status);
	if (none.length) {
		buckets.push({ key: NONE_KEY, label: 'Sem Andamento', color: '#7a8593', items: none });
	}
	for (const s of catalog.state.statuses) {
		const items = filtered.value.filter((t) => t.status?._id === s._id);
		if (items.length) {
			buckets.push({ key: s._id, label: s.label, color: s.color, group: s.group, items });
		}
	}
	return buckets;
});

function buildParams() {
	const q = search.value.trim();
	if (q) return { search: q };
	if (showDone.value) return { includeDone: true };
	return {};
}

async function refreshCounts() {
	try {
		Object.assign(counts, await api.todos.counts());
	} catch (e) {
		return;
	}
}

async function fetchTodos() {
	error.value = '';
	try {
		todos.value = await api.todos.getAll(buildParams());
	} catch (e) {
		error.value = 'Não foi possível carregar as tarefas. Verifique se a API está no ar.';
	}
}

async function load() {
	loading.value = true;
	try {
		await catalog.fetchAll();
		await Promise.all([fetchTodos(), refreshCounts()]);
		loaded.value = true;
	} finally {
		loading.value = false;
	}
}

let searchTimer;
watch(search, () => {
	clearTimeout(searchTimer);
	searchTimer = setTimeout(fetchTodos, 300);
});
watch(showDone, fetchTodos);

function toggleCollapse(key) {
	if (collapsed.has(key)) collapsed.delete(key);
	else collapsed.add(key);
}

function openComposer() {
	editing.value = null;
	showComposer.value = true;
	nextTick(() => composerEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

function startEdit(todo) {
	editing.value = todo;
	showComposer.value = true;
	nextTick(() => composerEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

function closeComposer() {
	editing.value = null;
	showComposer.value = false;
}

function upsert(todo) {
	const i = todos.value.findIndex((t) => t._id === todo._id);
	if (i === -1) todos.value.unshift(todo);
	else todos.value.splice(i, 1, todo);
}

async function onCreate(payload) {
	saving.value = true;
	error.value = '';
	try {
		const created = await api.todos.create(payload);
		todos.value.unshift(created);
		showComposer.value = false;
		refreshCounts();
	} catch (e) {
		error.value = 'Não foi possível adicionar a tarefa.';
	} finally {
		saving.value = false;
	}
}

async function onUpdate(payload) {
	const { id, ...patch } = payload;
	saving.value = true;
	error.value = '';
	try {
		const updated = await api.todos.update(id, patch);
		upsert(updated);
		closeComposer();
		refreshCounts();
	} catch (e) {
		error.value = 'Não foi possível salvar a tarefa.';
	} finally {
		saving.value = false;
	}
}

async function setField(id, patch) {
	busyIds.add(id);
	try {
		const updated = await api.todos.update(id, patch);
		upsert(updated);
		refreshCounts();
	} catch (e) {
		error.value = 'Não foi possível atualizar a tarefa.';
	} finally {
		busyIds.delete(id);
	}
}

function onStatus({ id, status }) {
	setField(id, { status });
}
function onCategory({ id, category }) {
	setField(id, { category });
}

async function onRemove(todo) {
	const index = todos.value.findIndex((t) => t._id === todo._id);
	if (index === -1) return;
	const [removed] = todos.value.splice(index, 1);
	if (editing.value?._id === todo._id) closeComposer();
	try {
		await api.todos.remove(todo._id);
		refreshCounts();
	} catch (e) {
		todos.value.splice(index, 0, removed);
		error.value = 'Não foi possível excluir a tarefa.';
	}
}

onMounted(load);
</script>

<template>
	<div class="painel">
		<header class="head">
			<div>
				<h1 class="section-title title">Painel de tarefas</h1>
				<span class="divider"></span>
			</div>
			<p class="section-desc counts">
				<span class="num">{{ counts.active }}</span> ativa(s) ·
				<span class="num">{{ counts.done }}</span> concluída(s) ·
				<span class="num">{{ counts.total }}</span> no total
			</p>
		</header>

		<div ref="composerEl">
			<TaskComposer
				v-if="showComposer || editing"
				:editing="editing"
				:busy="saving"
				@create="onCreate"
				@update="onUpdate"
				@cancel="closeComposer"
			/>
			<button v-else class="btn btn-primary" type="button" @click="openComposer">
				<v-icon icon="mdi-plus" size="16" /> Nova tarefa
			</button>
		</div>

		<div class="controls">
			<div class="search">
				<v-icon icon="mdi-magnify" size="18" class="search-icon" />
				<input v-model="search" class="field with-icon" type="search" placeholder="Localizar por nome ou issue…" aria-label="Buscar" />
			</div>
			<CategorySelect v-model="categoryFilter" all-label="Todas as categorias" />
			<label class="done-toggle" :class="{ off: isSearching }" :title="isSearching ? 'A busca já inclui os concluídos' : ''">
				<input v-model="showDone" type="checkbox" :disabled="isSearching" />
				<span>Ver concluídos</span>
			</label>
		</div>

		<v-expand-transition>
			<div v-if="error" class="banner" role="alert">
				<v-icon icon="mdi-alert-circle-outline" size="18" />
				<span>{{ error }}</span>
				<button class="banner-close" type="button" aria-label="Dispensar" @click="error = ''">
					<v-icon icon="mdi-close" size="16" />
				</button>
			</div>
		</v-expand-transition>

		<div v-if="loading && !loaded" class="grid">
			<div v-for="n in 6" :key="n" class="skeleton shimmer" />
		</div>

		<div v-else-if="groups.length === 0" class="empty card">
			<span class="divider"></span>
			<h3 class="section-title etitle">{{ todos.length === 0 ? 'Sem tarefas ainda' : 'Nada no filtro' }}</h3>
			<p class="etext">
				{{ todos.length === 0 ? 'Clique em “Nova tarefa” para adicionar a primeira.' : 'Ajuste a busca ou o filtro de categoria.' }}
			</p>
		</div>

		<section v-else class="groups">
			<div v-for="g in groups" :key="g.key" class="group">
				<button class="group-head" type="button" @click="toggleCollapse(g.key)">
					<v-icon :icon="collapsed.has(g.key) ? 'mdi-chevron-right' : 'mdi-chevron-down'" size="18" class="caret" />
					<span class="group-badge" :style="{ background: g.color }">{{ g.label }}</span>
					<span class="group-count num">{{ g.items.length }}</span>
				</button>

				<v-expand-transition>
					<div v-show="!collapsed.has(g.key)" class="grid">
						<TaskCard
							v-for="(t, i) in g.items"
							:key="t._id"
							v-reveal="Math.min(i * 45, 260)"
							:todo="t"
							:busy="busyIds.has(t._id)"
							@status="onStatus"
							@category="onCategory"
							@edit="startEdit"
							@remove="onRemove"
						/>
					</div>
				</v-expand-transition>
			</div>
		</section>
	</div>
</template>

<style scoped>
.painel {
	display: flex;
	flex-direction: column;
	gap: 26px;
}

.head {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.title {
	font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.2rem);
}

.counts {
	margin: 0;
}

.controls {
	display: flex;
	align-items: center;
	gap: 12px;
	flex-wrap: wrap;
}

.search {
	position: relative;
	flex: 1;
	min-width: 220px;
	max-width: 360px;
}

.search-icon {
	position: absolute;
	left: 11px;
	top: 50%;
	transform: translateY(-50%);
	color: var(--text-muted-on-light);
	pointer-events: none;
}

.field.with-icon {
	padding-left: 38px;
}

.done-toggle {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;
	user-select: none;
	font-size: var(--fs-sm);
	font-weight: 600;
	color: var(--text-muted-on-light);
	white-space: nowrap;
}

.done-toggle input {
	width: 16px;
	height: 16px;
	accent-color: var(--color-ink);
	cursor: pointer;
}

.done-toggle.off {
	opacity: 0.5;
	cursor: not-allowed;
}

.done-toggle.off input {
	cursor: not-allowed;
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

.group-badge {
	display: inline-flex;
	align-items: center;
	border-radius: var(--radius-pill);
	padding: 0.3rem 0.8rem;
	font-family: var(--font-head);
	font-weight: 700;
	font-size: var(--fs-xs);
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: #fff;
}

.group-count {
	font-family: var(--font-head);
	font-weight: 700;
	font-size: 12px;
	color: var(--text-muted-on-light);
}

.grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: var(--space-4);
	align-items: start;
}

.skeleton {
	height: 150px;
	border-radius: var(--radius-md);
	border: 1px solid var(--border-subtle);
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
