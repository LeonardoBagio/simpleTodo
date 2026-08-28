<script setup>
import { ref, computed } from 'vue';
import { relativeTime } from '../utils/time';
import StateLamp from './StateLamp.vue';

const props = defineProps({
	todo: { type: Object, required: true },
	busy: { type: Boolean, default: false },
});
const emit = defineEmits(['toggle', 'remove']);

const confirming = ref(false);
const when = computed(() => relativeTime(props.todo.createdAt));

const status = computed(() =>
	props.todo.completed
		? { label: 'Concluída', color: 'var(--lamp-done)' }
		: { label: 'Pendente', color: 'var(--lamp-todo)' },
);
</script>

<template>
	<article class="task card card-lift" :class="{ done: todo.completed, busy }">
		<div class="task-head">
			<button
				class="state-pill"
				type="button"
				:aria-pressed="todo.completed"
				:title="todo.completed ? 'Reabrir tarefa' : 'Concluir tarefa'"
				@click="emit('toggle', todo)"
			>
				<StateLamp :color="status.color" :size="9" />
				<span>{{ status.label }}</span>
			</button>

			<div v-if="!confirming" class="actions">
				<button
					class="icon-btn"
					type="button"
					:disabled="busy"
					:title="todo.completed ? 'Marcar como pendente' : 'Concluir'"
					:aria-label="todo.completed ? 'Marcar como pendente' : 'Concluir'"
					@click="emit('toggle', todo)"
				>
					<v-icon :icon="todo.completed ? 'mdi-undo-variant' : 'mdi-check'" size="17" />
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

		<h3 class="task-title">{{ todo.title }}</h3>

		<div class="task-foot">
			<span v-if="when" class="when num" :title="when">{{ when }}</span>
		</div>
	</article>
</template>

<style scoped>
.task {
	padding: 20px;
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.task.busy {
	opacity: 0.55;
	pointer-events: none;
}

.task.done {
	background: linear-gradient(180deg, rgba(75, 189, 107, 0.06), var(--surface) 55%);
}

.task-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.state-pill {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	background: var(--bg-light);
	border: 0;
	border-radius: var(--radius-pill);
	padding: 0.3rem 0.7rem;
	font-family: var(--font-head);
	font-weight: 700;
	font-size: var(--fs-xs);
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: var(--text-dark);
	cursor: pointer;
	transition: background 0.2s var(--ease);
}

.state-pill:hover {
	background: rgba(0, 0, 0, 0.1);
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

.task.done .task-title {
	color: var(--text-muted-on-light);
	text-decoration: line-through;
	text-decoration-color: color-mix(in srgb, var(--lamp-done) 70%, transparent);
}

.task-foot {
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.when {
	font-family: var(--font-head);
	font-size: 11px;
	font-weight: 600;
	color: var(--text-muted-on-light);
}
</style>
