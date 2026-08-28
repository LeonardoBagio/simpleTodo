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
const loaded = ref(false);
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
		loaded.value = true;
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
	<div class="board">
		<ProgressHeader :total="total" :done="doneCount" />

		<TodoComposer :busy="adding" @add="addTodo" />

		<div class="controls">
			<TodoFilters v-model="filter" :counts="counts" />
			<button
				v-if="doneCount > 0"
				class="btn btn-outline clear-btn"
				type="button"
				@click="clearDone"
			>
				<v-icon icon="mdi-broom" size="15" />
				<span>Limpar concluídas</span>
			</button>
		</div>

		<v-expand-transition>
			<div v-if="error" class="banner" role="alert">
				<v-icon icon="mdi-alert-circle-outline" size="18" />
				<span>{{ error }}</span>
				<button class="banner-close" type="button" aria-label="Dispensar aviso" @click="error = ''">
					<v-icon icon="mdi-close" size="16" />
				</button>
			</div>
		</v-expand-transition>

		<section aria-label="Tarefas">
			<div v-if="loading && !loaded" class="grid">
				<div v-for="n in 6" :key="n" class="skeleton" />
			</div>

			<EmptyState v-else-if="filtered.length === 0" :filter="filter" />

			<transition-group v-else tag="div" name="list" class="grid">
				<TodoItem
					v-for="(todo, i) in filtered"
					:key="todo._id"
					v-reveal="Math.min(i * 55, 330)"
					:todo="todo"
					:busy="busyIds.has(todo._id)"
					@toggle="toggleTodo"
					@remove="removeTodo"
				/>
			</transition-group>
		</section>
	</div>
</template>

<style scoped>
.board {
	display: flex;
	flex-direction: column;
	gap: 28px;
}

.controls {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	flex-wrap: wrap;
}

.clear-btn {
	font-size: var(--fs-xs);
	padding: 0.5rem 0.95rem;
}

.grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: var(--space-5);
	align-items: start;
}

.skeleton {
	height: 168px;
	border-radius: var(--radius-md);
	border: 1px solid var(--border-subtle);
	background: linear-gradient(
		90deg,
		rgba(0, 0, 0, 0.03) 0%,
		rgba(0, 0, 0, 0.06) 50%,
		rgba(0, 0, 0, 0.03) 100%
	);
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

.banner {
	display: flex;
	align-items: center;
	gap: 10px;
	background: color-mix(in srgb, var(--lamp-trash) 10%, var(--surface));
	color: var(--lamp-trash);
	border: 1px solid color-mix(in srgb, var(--lamp-trash) 30%, transparent);
	border-radius: var(--radius-sm);
	padding: 11px 12px 11px 14px;
	font-size: var(--fs-sm);
	font-weight: 600;
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
	background: color-mix(in srgb, var(--lamp-trash) 14%, transparent);
}

.list-enter-from {
	opacity: 0;
	transform: translateY(-6px);
}

.list-enter-active {
	transition: opacity 0.25s var(--ease), transform 0.25s var(--ease);
}

.list-leave-active {
	transition: opacity 0.2s ease, transform 0.2s ease;
	position: absolute;
}

.list-leave-to {
	opacity: 0;
	transform: scale(0.96);
}

.list-move {
	transition: transform 0.28s var(--ease);
}

@media (prefers-reduced-motion: reduce) {
	.skeleton {
		animation: none;
	}
	.list-enter-active,
	.list-leave-active,
	.list-move {
		transition: none;
	}
}
</style>
