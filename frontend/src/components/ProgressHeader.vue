<script setup>
import { computed } from 'vue';
import { todayLabel } from '../utils/time';

const props = defineProps({
	total: { type: Number, default: 0 },
	done: { type: Number, default: 0 },
});

const pending = computed(() => props.total - props.done);
const pct = computed(() => (props.total ? Math.round((props.done / props.total) * 100) : 0));
const pendingLabel = computed(() =>
	pending.value === 1 ? '1 pendente' : `${pending.value} pendentes`,
);
const date = todayLabel();
</script>

<template>
	<header class="head">
		<h1 class="title">Suas tarefas</h1>
		<p class="subtitle"><b>{{ pendingLabel }}</b> · {{ date }}</p>

		<div class="progress">
			<div class="progress-top">
				<span class="lead">
					<span class="num">{{ done }}</span> de <span class="num">{{ total }}</span> concluídas
				</span>
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
	margin-bottom: 26px;
}

.title {
	font-size: clamp(30px, 5vw, 40px);
	font-weight: 800;
	letter-spacing: -0.035em;
	line-height: 1.05;
	color: var(--text);
}

.subtitle {
	color: var(--text-2);
	font-size: 14.5px;
	margin-top: 8px;
	font-weight: 500;
}

.subtitle b {
	color: var(--text);
	font-weight: 700;
}

.progress {
	margin-top: 22px;
}

.progress-top {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	margin-bottom: 9px;
}

.progress-top .lead {
	font-size: 13px;
	font-weight: 700;
	color: var(--text-2);
}

.progress-top .pct {
	font-size: 13px;
	font-weight: 700;
	color: var(--accent);
}

.track {
	height: 8px;
	border-radius: 20px;
	background: var(--surface-inset);
	overflow: hidden;
	box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
}

.bar {
	height: 100%;
	border-radius: 20px;
	background: linear-gradient(90deg, var(--accent), var(--accent-strong));
	transition: width 0.55s var(--ease-out);
}
</style>
