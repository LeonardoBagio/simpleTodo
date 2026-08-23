<script setup>
import { computed } from 'vue';
import { relativeTime } from '../utils/time';

const props = defineProps({
	todo: { type: Object, required: true },
	busy: { type: Boolean, default: false },
});
const emit = defineEmits(['toggle', 'remove']);

const when = computed(() => relativeTime(props.todo.createdAt));
</script>

<template>
	<li class="task" :class="{ done: todo.completed, busy }">
		<button
			class="check focusable"
			type="button"
			role="checkbox"
			:aria-checked="todo.completed"
			:aria-label="todo.completed ? 'Reabrir tarefa' : 'Concluir tarefa'"
			@click="emit('toggle', todo)"
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
				<path d="M5 12.5l4.2 4.2L19 6.5" />
			</svg>
		</button>

		<div class="task-body">
			<span class="task-title">{{ todo.title }}</span>
			<div class="task-meta">
				<span v-if="when">{{ when }}</span>
			</div>
		</div>

		<div class="task-actions">
			<button
				class="del focusable"
				type="button"
				aria-label="Excluir tarefa"
				@click="emit('remove', todo)"
			>
				<v-icon icon="mdi-trash-can-outline" size="18" />
			</button>
		</div>
	</li>
</template>

<style scoped>
.task {
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 15px 16px;
	border-bottom: 1px solid var(--border);
	position: relative;
	transition: background 0.18s;
}

.task:last-child {
	border-bottom: 0;
}

.task:hover {
	background: var(--surface-2);
}

.task.busy {
	opacity: 0.6;
	pointer-events: none;
}

.check {
	flex: none;
	width: 24px;
	height: 24px;
	border-radius: 50%;
	border: 2px solid var(--border-strong);
	background: var(--surface);
	cursor: pointer;
	display: grid;
	place-items: center;
	transition: border-color 0.2s, background 0.2s var(--ease-spring);
}

.check:hover {
	border-color: var(--accent);
}

.check svg {
	width: 13px;
	height: 13px;
	color: #fff;
	opacity: 0;
	transform: scale(0.4);
	transition: opacity 0.18s, transform 0.28s var(--ease-spring);
}

.check svg path {
	stroke-dasharray: 20;
	stroke-dashoffset: 20;
	transition: stroke-dashoffset 0.3s 0.05s var(--ease-out);
}

.done .check {
	background: var(--success);
	border-color: var(--success);
	animation: pop 0.34s var(--ease-spring);
}

.done .check svg {
	opacity: 1;
	transform: scale(1);
}

.done .check svg path {
	stroke-dashoffset: 0;
}

@keyframes pop {
	0% {
		transform: scale(1);
	}
	45% {
		transform: scale(1.22);
	}
	100% {
		transform: scale(1);
	}
}

.task-body {
	flex: 1;
	min-width: 0;
}

.task-title {
	font-size: 15px;
	font-weight: 600;
	color: var(--text);
	letter-spacing: -0.01em;
	display: inline;
	background-image: linear-gradient(currentColor, currentColor);
	background-repeat: no-repeat;
	background-position: 0 60%;
	background-size: 0% 1.5px;
	transition: background-size 0.35s var(--ease-out), color 0.3s;
	overflow-wrap: anywhere;
}

.done .task-title {
	color: var(--text-3);
	background-size: 100% 1.5px;
}

.task-meta {
	font-size: 12px;
	color: var(--text-3);
	margin-top: 3px;
	font-weight: 500;
	min-height: 14px;
}

.task-actions {
	flex: none;
	display: flex;
	gap: 4px;
	opacity: 0;
	transform: translateX(4px);
	transition: opacity 0.18s, transform 0.18s;
}

.task:hover .task-actions,
.task:focus-within .task-actions {
	opacity: 1;
	transform: none;
}

.del {
	width: 34px;
	height: 34px;
	border-radius: 9px;
	border: 1px solid transparent;
	background: transparent;
	color: var(--text-3);
	cursor: pointer;
	display: grid;
	place-items: center;
	transition: background 0.16s, color 0.16s, border-color 0.16s;
}

.del:hover {
	background: var(--danger-weak);
	color: var(--danger);
	border-color: color-mix(in srgb, var(--danger) 26%, transparent);
}

@media (hover: none) {
	.task-actions {
		opacity: 1;
		transform: none;
	}
}
</style>
