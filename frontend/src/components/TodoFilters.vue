<script setup>
import StateLamp from './StateLamp.vue';

defineProps({
	modelValue: { type: String, default: 'all' },
	counts: {
		type: Object,
		default: () => ({ all: 0, active: 0, done: 0 }),
	},
});
const emit = defineEmits(['update:modelValue']);

const tabs = [
	{ key: 'all', label: 'Todas', color: '#999999' },
	{ key: 'active', label: 'Pendentes', color: '#4a9fd4' },
	{ key: 'done', label: 'Concluídas', color: '#4bbd6b' },
];
</script>

<template>
	<div class="ribbon" role="tablist" aria-label="Filtro de tarefas">
		<button
			v-for="tab in tabs"
			:key="tab.key"
			class="chip"
			:class="{ active: modelValue === tab.key }"
			role="tab"
			type="button"
			:aria-selected="modelValue === tab.key"
			@click="emit('update:modelValue', tab.key)"
		>
			<StateLamp :color="tab.color" :size="9" />
			<span class="label">{{ tab.label }}</span>
			<span class="count num">{{ counts[tab.key] }}</span>
		</button>
	</div>
</template>

<style scoped>
.ribbon {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.chip {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	background: var(--surface);
	border: 1px solid var(--border-subtle);
	border-radius: var(--radius-pill);
	padding: 0.42rem 0.85rem;
	cursor: pointer;
	transition:
		border-color 0.2s var(--ease),
		box-shadow 0.2s var(--ease),
		background 0.2s var(--ease);
}

.chip:hover {
	border-color: var(--border-strong);
}

.chip .label {
	font-family: var(--font-head);
	font-weight: 700;
	font-size: var(--fs-xs);
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: var(--text-muted-on-light);
}

.chip .count {
	font-family: var(--font-head);
	font-weight: 700;
	font-size: 11px;
	color: var(--color-mist);
	min-width: 1ch;
	text-align: center;
}

.chip.active {
	background: var(--color-ink);
	border-color: var(--color-ink);
	box-shadow: var(--shadow-sm);
}

.chip.active .label {
	color: var(--color-white);
}

.chip.active .count {
	color: rgba(255, 255, 255, 0.7);
}
</style>
