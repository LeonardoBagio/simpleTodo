<script setup>
import { ref, computed } from 'vue';
import StateSelect from './StateSelect.vue';
import CategorySelect from './CategorySelect.vue';
import { fmtDate } from '../utils/states';

const props = defineProps({
	todo: { type: Object, required: true },
	busy: { type: Boolean, default: false },
});
const emit = defineEmits(['status', 'category', 'edit', 'remove']);

const confirming = ref(false);

const status = computed(() => props.todo.status || null);
const isDone = computed(() => status.value?.group === 'concluidos');
const isDoing = computed(() => status.value?.group === 'em_andamento');
const accent = computed(() => status.value?.color || '#7a8593');

const cardStyle = computed(() =>
	isDoing.value
		? {
				borderColor: accent.value + '80',
				background: `linear-gradient(180deg, ${accent.value}14, var(--surface) 55%)`,
				boxShadow: `0 16px 36px -18px rgba(0,0,0,0.18), 0 0 22px -10px ${accent.value}`,
			}
		: {},
);

function onStatus(id) {
	emit('status', { id: props.todo._id, status: id });
}
function onCategory(id) {
	emit('category', { id: props.todo._id, category: id });
}
</script>

<template>
	<article class="task card" :class="{ 'card-lift': !isDoing, busy }" :style="cardStyle">
		<div class="task-head">
			<StateSelect
				:model-value="status ? status._id : null"
				all-label="Sem Andamento"
				placeholder="Sem Andamento"
				@update:model-value="onStatus"
			/>

			<div v-if="!confirming" class="actions">
				<button class="icon-btn" type="button" title="Editar tarefa" aria-label="Editar tarefa" @click="emit('edit', todo)">
					<v-icon icon="mdi-pencil-outline" size="16" />
				</button>
				<button
					class="icon-btn danger"
					type="button"
					:disabled="busy"
					title="Excluir tarefa"
					aria-label="Excluir tarefa"
					@click="confirming = true"
				>
					<v-icon icon="mdi-trash-can-outline" size="16" />
				</button>
			</div>

			<div v-else class="confirm">
				<span class="engraved q">Excluir?</span>
				<button class="yes" type="button" :disabled="busy" @click="emit('remove', todo)">Sim</button>
				<button class="no" type="button" @click="confirming = false">Não</button>
			</div>
		</div>

		<h3 class="task-title" :class="{ done: isDone }">{{ todo.title }}</h3>

		<div class="task-foot">
			<CategorySelect
				:model-value="todo.category ? todo.category._id : null"
				all-label="Sem categoria"
				@update:model-value="onCategory"
			/>
			<span class="when num" :title="`Última edição: ${fmtDate(todo.updatedAt)}`">{{ fmtDate(todo.updatedAt) }}</span>
		</div>
	</article>
</template>

<style scoped>
.task {
	padding: 18px;
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.task.busy {
	opacity: 0.55;
	pointer-events: none;
}

.task-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
}

.actions {
	display: flex;
	align-items: center;
	gap: 4px;
}

.icon-btn {
	width: 32px;
	height: 32px;
	border-radius: var(--radius-sm);
	border: 0;
	background: transparent;
	color: var(--text-muted-on-light);
	cursor: pointer;
	display: grid;
	place-items: center;
	transition: background 0.16s, color 0.16s;
}

.icon-btn:hover:not(:disabled) {
	background: var(--bg-light);
	color: var(--color-ink);
}

.icon-btn.danger:hover:not(:disabled) {
	background: color-mix(in srgb, var(--lamp-trash) 12%, transparent);
	color: var(--lamp-trash);
}

.icon-btn:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

.confirm {
	display: flex;
	align-items: center;
	gap: 6px;
}

.confirm .q {
	font-size: 9px;
	color: var(--text-muted-on-light);
}

.confirm .yes,
.confirm .no {
	border-radius: var(--radius-sm);
	padding: 4px 8px;
	font-family: var(--font-head);
	font-size: 10px;
	font-weight: 700;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	cursor: pointer;
}

.confirm .yes {
	border: 0;
	background: var(--lamp-trash);
	color: var(--color-white);
}

.confirm .no {
	border: 1px solid var(--border-strong);
	background: transparent;
	color: var(--text-muted-on-light);
}

.confirm .no:hover {
	color: var(--color-ink);
}

.task-title {
	font-family: var(--font-head);
	font-weight: 700;
	font-size: 16px;
	text-transform: uppercase;
	letter-spacing: 0.02em;
	line-height: 1.35;
	color: var(--color-ink);
	overflow-wrap: anywhere;
}

.task-title.done {
	color: var(--text-muted-on-light);
	text-decoration: line-through;
	text-decoration-color: color-mix(in srgb, var(--lamp-done) 70%, transparent);
}

.task-foot {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
	flex-wrap: wrap;
}

.when {
	font-family: var(--font-head);
	font-size: 11px;
	font-weight: 600;
	color: var(--text-muted-on-light);
	white-space: nowrap;
}
</style>
