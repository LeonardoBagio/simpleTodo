<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api from '../services/api';
import ProgressHeader from '../components/ProgressHeader.vue';
import TodoComposer from '../components/TodoComposer.vue';
import TodoFilters from '../components/TodoFilters.vue';
import TodoItem from '../components/TodoItem.vue';
import EmptyState from '../components/EmptyState.vue';

const todos = ref([]);
const loading = ref(true);
const error = ref('');
const adding = ref(false);
const filter = ref('all');
const busyIds = reactive(new Set());

const doneCount = computed(() => todos.value.filter((t) => t.completed).length);
const total = computed(() => todos.value.length);
const pending = computed(() => total.value - doneCount.value);

const counts = computed(() => ({
	all: total.value,
	active: pending.value,
	done: doneCount.value,
}));

const filtered = computed(() => {
	if (filter.value === 'done') return todos.value.filter((t) => t.completed);
	if (filter.value === 'active') return todos.value.filter((t) => !t.completed);
	return todos.value;
});

async function load() {
	loading.value = true;
	error.value = '';
	try {
		todos.value = await api.getAll();
	} catch (e) {
		error.value = 'Não foi possível carregar as tarefas. Verifique se a API está no ar.';
	} finally {
		loading.value = false;
	}
}

async function addTodo(title) {
	adding.value = true;
	error.value = '';
	try {
		const created = await api.create(title);
		todos.value.unshift(created);
		if (filter.value === 'done') filter.value = 'all';
	} catch (e) {
		error.value = 'Não foi possível adicionar a tarefa.';
	} finally {
		adding.value = false;
	}
}

async function toggleTodo(todo) {
	const next = !todo.completed;
	todo.completed = next;
	busyIds.add(todo._id);
	try {
		const updated = await api.update(todo._id, { completed: next });
		Object.assign(todo, updated);
	} catch (e) {
		todo.completed = !next;
		error.value = 'Não foi possível atualizar a tarefa.';
	} finally {
		busyIds.delete(todo._id);
	}
}

async function removeTodo(todo) {
	const index = todos.value.findIndex((t) => t._id === todo._id);
	if (index === -1) return;
	const [removed] = todos.value.splice(index, 1);
	try {
		await api.remove(todo._id);
	} catch (e) {
		todos.value.splice(index, 0, removed);
		error.value = 'Não foi possível excluir a tarefa.';
	}
}

async function clearDone() {
	const completed = todos.value.filter((t) => t.completed);
	if (completed.length === 0) return;
	todos.value = todos.value.filter((t) => !t.completed);
	try {
		await Promise.all(completed.map((t) => api.remove(t._id)));
	} catch (e) {
		error.value = 'Algumas tarefas concluídas não puderam ser removidas.';
		await load();
	}
}

onMounted(load);
</script>

<template>
	<ProgressHeader :total="total" :done="doneCount" />

	<TodoComposer :busy="adding" @add="addTodo" />

	<TodoFilters v-model="filter" :counts="counts" />

	<v-expand-transition>
		<div v-if="error" class="banner" role="alert">
			<v-icon icon="mdi-alert-circle-outline" size="18" />
			<span>{{ error }}</span>
			<button class="banner-close" type="button" aria-label="Dispensar aviso" @click="error = ''">
				<v-icon icon="mdi-close" size="16" />
			</button>
		</div>
	</v-expand-transition>

	<div class="card">
		<ul v-if="loading" class="list" aria-hidden="true">
			<li v-for="n in 4" :key="n" class="skeleton-row">
				<span class="sk sk-check"></span>
				<span class="sk sk-line" :style="{ width: 55 + (n % 3) * 12 + '%' }"></span>
			</li>
		</ul>

		<EmptyState v-else-if="filtered.length === 0" :filter="filter" />

		<transition-group v-else tag="ul" name="list" class="list">
			<TodoItem
				v-for="todo in filtered"
				:key="todo._id"
				:todo="todo"
				:busy="busyIds.has(todo._id)"
				@toggle="toggleTodo"
				@remove="removeTodo"
			/>
		</transition-group>

		<div v-if="!loading && total > 0" class="listfoot">
			<span><span class="num">{{ pending }}</span> {{ pending === 1 ? 'pendente' : 'pendentes' }}</span>
			<button v-if="doneCount > 0" class="clear" type="button" @click="clearDone">
				Limpar concluídas
			</button>
		</div>
	</div>
</template>

<style scoped>
.card {
	background: var(--surface);
	border: 1px solid var(--border);
	border-radius: var(--radius);
	box-shadow: var(--shadow-2);
	overflow: hidden;
}

.list {
	list-style: none;
	padding: 0;
	margin: 0;
	position: relative;
}

.banner {
	display: flex;
	align-items: center;
	gap: 10px;
	background: var(--danger-weak);
	color: var(--danger);
	border: 1px solid color-mix(in srgb, var(--danger) 24%, transparent);
	border-radius: var(--radius-sm);
	padding: 11px 12px 11px 14px;
	font-size: 13.5px;
	font-weight: 600;
	margin-bottom: 14px;
}

.banner span {
	flex: 1;
}

.banner-close {
	flex: none;
	border: 0;
	background: transparent;
	color: inherit;
	cursor: pointer;
	display: grid;
	place-items: center;
	border-radius: 7px;
	width: 26px;
	height: 26px;
	opacity: 0.8;
}

.banner-close:hover {
	opacity: 1;
	background: color-mix(in srgb, var(--danger) 14%, transparent);
}

.listfoot {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 13px 16px;
	background: var(--surface-2);
	border-top: 1px solid var(--border);
	font-size: 12.5px;
	color: var(--text-2);
	font-weight: 600;
}

.clear {
	border: 0;
	background: transparent;
	color: var(--text-3);
	font: inherit;
	font-weight: 700;
	font-size: 12.5px;
	cursor: pointer;
	padding: 4px 6px;
	border-radius: 7px;
	transition: color 0.16s, background 0.16s;
}

.clear:hover {
	color: var(--danger);
	background: var(--danger-weak);
}

.skeleton-row {
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 15px 16px;
	border-bottom: 1px solid var(--border);
}

.skeleton-row:last-child {
	border-bottom: 0;
}

.sk {
	display: block;
	border-radius: 8px;
	background: linear-gradient(
		90deg,
		var(--surface-inset) 0%,
		var(--surface-2) 50%,
		var(--surface-inset) 100%
	);
	background-size: 200% 100%;
	animation: shimmer 1.3s ease-in-out infinite;
}

.sk-check {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	flex: none;
}

.sk-line {
	height: 12px;
}

@keyframes shimmer {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}

.list-enter-from {
	opacity: 0;
	transform: translateY(-6px);
}

.list-enter-active {
	transition: opacity 0.25s var(--ease-out), transform 0.25s var(--ease-out);
}

.list-leave-active {
	transition: opacity 0.2s ease, transform 0.2s ease;
	position: absolute;
	width: 100%;
}

.list-leave-to {
	opacity: 0;
	transform: translateX(-10px);
}

.list-move {
	transition: transform 0.28s var(--ease-out);
}

@media (prefers-reduced-motion: reduce) {
	.sk {
		animation: none;
	}
	.list-enter-active,
	.list-leave-active,
	.list-move {
		transition: none;
	}
}
</style>
