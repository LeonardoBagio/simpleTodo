<script setup>
defineProps({
	status: { type: Object, default: null },
	emptyLabel: { type: String, default: 'Sem Andamento' },
});
</script>

<template>
	<span v-if="status" class="status-badge" :style="{ background: status.color }">{{ status.label }}</span>
	<span v-else class="status-badge is-empty">{{ emptyLabel }}</span>
</template>

<style scoped>
.status-badge {
	display: inline-flex;
	align-items: center;
	max-width: 100%;
	justify-content: center;
	text-align: center;
	border-radius: var(--radius-pill);
	padding: 0.28rem 0.7rem;
	font-family: var(--font-head);
	font-weight: 700;
	font-size: var(--fs-xs);
	line-height: 1.15;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: #fff;
	overflow-wrap: anywhere;
	text-wrap: balance;
}

.status-badge.is-empty {
	background: var(--bg-light);
	color: var(--text-muted-on-light);
}
</style>
