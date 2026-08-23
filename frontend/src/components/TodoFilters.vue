<script setup>
defineProps({
	modelValue: { type: String, default: 'all' },
	counts: {
		type: Object,
		default: () => ({ all: 0, active: 0, done: 0 }),
	},
});
const emit = defineEmits(['update:modelValue']);

const tabs = [
	{ key: 'all', label: 'Todas' },
	{ key: 'active', label: 'Pendentes' },
	{ key: 'done', label: 'Concluídas' },
];
</script>

<template>
	<div class="filters" role="tablist" aria-label="Filtro de tarefas">
		<button
			v-for="tab in tabs"
			:key="tab.key"
			class="focusable"
			role="tab"
			type="button"
			:aria-selected="modelValue === tab.key"
			@click="emit('update:modelValue', tab.key)"
		>
			{{ tab.label }}
			<span class="count num">{{ counts[tab.key] }}</span>
		</button>
	</div>
</template>

<style scoped>
.filters {
	display: inline-flex;
	gap: 2px;
	padding: 4px;
	background: var(--surface-inset);
	border-radius: 12px;
	margin-bottom: 14px;
}

.filters button {
	border: 0;
	background: transparent;
	color: var(--text-2);
	font: inherit;
	font-weight: 700;
	font-size: 13px;
	padding: 7px 14px;
	border-radius: 9px;
	cursor: pointer;
	transition: color 0.18s, background 0.18s, box-shadow 0.18s;
	display: inline-flex;
	align-items: center;
	gap: 7px;
}

.filters button .count {
	font-size: 11px;
	font-weight: 700;
	color: var(--text-3);
}

.filters button[aria-selected='true'] {
	background: var(--surface);
	color: var(--text);
	box-shadow: var(--shadow-1);
}

.filters button[aria-selected='true'] .count {
	color: var(--accent);
}
</style>
