<script setup>
import { computed } from 'vue';

const props = defineProps({
	total: { type: Number, default: 0 },
	done: { type: Number, default: 0 },
});

const pending = computed(() => props.total - props.done);
const pct = computed(() => (props.total ? Math.round((props.done / props.total) * 100) : 0));
</script>

<template>
	<header class="head">
		<h1 class="section-title title">Painel de tarefas</h1>
		<span class="divider"></span>
		<p class="section-desc counts">
			<span class="num">{{ pending }}</span> ativa(s) ·
			<span class="num">{{ done }}</span> concluída(s) ·
			<span class="num">{{ total }}</span> no total
		</p>

		<div v-if="total > 0" class="progress">
			<div class="progress-top">
				<span class="eyebrow lead">Progresso</span>
				<span class="pct num">{{ pct }}%</span>
			</div>
			<div class="track">
				<div class="bar" :style="{ width: pct + '%' }"></div>
			</div>
		</div>
	</header>
</template>

<style scoped>
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

.progress {
	margin-top: 6px;
	max-width: 340px;
}

.progress-top {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	margin-bottom: 8px;
}

.progress-top .lead {
	font-size: 10px;
	color: var(--text-muted-on-light);
}

.progress-top .pct {
	font-family: var(--font-head);
	font-size: 13px;
	font-weight: 700;
	color: var(--color-ink);
}

.track {
	height: 6px;
	border-radius: var(--radius-pill);
	background: rgba(0, 0, 0, 0.08);
	overflow: hidden;
}

.bar {
	height: 100%;
	border-radius: var(--radius-pill);
	background: var(--color-ink);
	transition: width 0.55s var(--ease);
}
</style>
