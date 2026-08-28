<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import api from '../services/api';
import { useCatalog } from '../stores/catalog';
import { GROUP_ORDER, GROUP_LABEL } from '../utils/states';
import CategorySelect from '../components/CategorySelect.vue';

Chart.register(...registerables);

const catalog = useCatalog();
const todos = ref([]);
const loading = ref(true);
const error = ref('');
const categoryFilter = ref(null);

const GROUP_COLOR = {
	a_fazer: '#9b9a97',
	em_andamento: '#337ea9',
	concluidos: '#448361',
};
const NONE_COLOR = '#7a8593';
const FONT = "'Montserrat', system-ui, sans-serif";

const scoped = computed(() =>
	categoryFilter.value
		? todos.value.filter((t) => t.category?._id === categoryFilter.value)
		: todos.value,
);

const total = computed(() => scoped.value.length);
const entregues = computed(
	() => scoped.value.filter((t) => t.status?.group === 'concluidos').length,
);
const ativas = computed(() => total.value - entregues.value);
const taxa = computed(() => (total.value ? Math.round((entregues.value / total.value) * 100) : 0));

const catCanvas = ref(null);
const groupCanvas = ref(null);
const statusCanvas = ref(null);
let catChart = null;
let groupChart = null;
let statusChart = null;

function countByCategory(list) {
	const cats = catalog.state.categories;
	const labels = [...cats.map((c) => c.label), 'Sem categoria'];
	const colors = [...cats.map((c) => c.color), NONE_COLOR];
	const data = [
		...cats.map((c) => list.filter((t) => t.category?._id === c._id).length),
		list.filter((t) => !t.category).length,
	];
	return { labels, colors, data };
}

function baseOptions(extra = {}) {
	return {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			tooltip: {
				titleFont: { family: FONT },
				bodyFont: { family: FONT },
			},
		},
		...extra,
	};
}

function axisFont() {
	return {
		ticks: { font: { family: FONT }, color: '#5c5c5c', precision: 0 },
		grid: { color: 'rgba(0,0,0,0.06)' },
	};
}

function renderCharts() {
	destroyCharts();
	if (!catCanvas.value) return;

	const entregas = scoped.value.filter((t) => t.status?.group === 'concluidos');
	const byCat = countByCategory(entregas);
	catChart = new Chart(catCanvas.value, {
		type: 'bar',
		data: {
			labels: byCat.labels,
			datasets: [{ data: byCat.data, backgroundColor: byCat.colors, borderRadius: 6 }],
		},
		options: baseOptions({
			scales: { x: axisFont(), y: { ...axisFont(), beginAtZero: true } },
		}),
	});

	const groupLabels = [...GROUP_ORDER.map((g) => GROUP_LABEL[g]), 'Sem Andamento'];
	const groupColors = [...GROUP_ORDER.map((g) => GROUP_COLOR[g]), NONE_COLOR];
	const groupData = [
		...GROUP_ORDER.map((g) => scoped.value.filter((t) => t.status?.group === g).length),
		scoped.value.filter((t) => !t.status).length,
	];
	groupChart = new Chart(groupCanvas.value, {
		type: 'doughnut',
		data: { labels: groupLabels, datasets: [{ data: groupData, backgroundColor: groupColors, borderWidth: 0 }] },
		options: baseOptions({
			cutout: '62%',
			plugins: {
				legend: {
					display: true,
					position: 'bottom',
					labels: { font: { family: FONT, size: 11 }, color: '#5c5c5c', boxWidth: 12, padding: 12 },
				},
			},
		}),
	});

	const statuses = catalog.state.statuses;
	statusChart = new Chart(statusCanvas.value, {
		type: 'bar',
		data: {
			labels: statuses.map((s) => s.label),
			datasets: [
				{
					data: statuses.map((s) => scoped.value.filter((t) => t.status?._id === s._id).length),
					backgroundColor: statuses.map((s) => s.color),
					borderRadius: 6,
				},
			],
		},
		options: baseOptions({
			indexAxis: 'y',
			scales: { x: { ...axisFont(), beginAtZero: true }, y: axisFont() },
		}),
	});
}

function destroyCharts() {
	catChart?.destroy();
	groupChart?.destroy();
	statusChart?.destroy();
	catChart = groupChart = statusChart = null;
}

async function load() {
	loading.value = true;
	error.value = '';
	try {
		await catalog.fetchAll();
		todos.value = await api.todos.getAll();
		await nextTick();
		renderCharts();
	} catch (e) {
		error.value = 'Não foi possível carregar os dados do dashboard.';
	} finally {
		loading.value = false;
	}
}

watch([categoryFilter, () => catalog.state.statuses.length], () => {
	if (!loading.value) nextTick(renderCharts);
});

onMounted(load);
onBeforeUnmount(destroyCharts);
</script>

<template>
	<div class="dashboard">
		<header class="head">
			<div>
				<h1 class="section-title title">Dashboard</h1>
				<span class="divider"></span>
			</div>
			<div class="filter">
				<span class="eyebrow flabel">Filtrar por categoria</span>
				<CategorySelect v-model="categoryFilter" all-label="Todas as categorias" />
			</div>
		</header>

		<div v-if="error" class="banner" role="alert">{{ error }}</div>

		<div class="stats">
			<div class="stat card">
				<span class="stat-num num">{{ total }}</span>
				<span class="stat-label eyebrow">Tarefas</span>
			</div>
			<div class="stat card">
				<span class="stat-num num">{{ ativas }}</span>
				<span class="stat-label eyebrow">Em aberto</span>
			</div>
			<div class="stat card">
				<span class="stat-num num">{{ entregues }}</span>
				<span class="stat-label eyebrow">Entregues</span>
			</div>
			<div class="stat card">
				<span class="stat-num num">{{ taxa }}%</span>
				<span class="stat-label eyebrow">Conclusão</span>
			</div>
		</div>

		<div class="charts">
			<div class="chart-card card wide">
				<h3 class="chart-title section-title">Entregas por categoria</h3>
				<p class="chart-desc section-desc">Tarefas concluídas agrupadas por categoria.</p>
				<div class="canvas-wrap"><canvas ref="catCanvas"></canvas></div>
			</div>

			<div class="chart-card card">
				<h3 class="chart-title section-title">Distribuição por andamento</h3>
				<p class="chart-desc section-desc">Proporção entre os grupos de status.</p>
				<div class="canvas-wrap"><canvas ref="groupCanvas"></canvas></div>
			</div>

			<div class="chart-card card wide">
				<h3 class="chart-title section-title">Tarefas por status</h3>
				<p class="chart-desc section-desc">Contagem em cada status cadastrado.</p>
				<div class="canvas-wrap tall"><canvas ref="statusCanvas"></canvas></div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.dashboard {
	display: flex;
	flex-direction: column;
	gap: 26px;
}

.head {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 16px;
	flex-wrap: wrap;
}

.title {
	font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.2rem);
}

.filter {
	display: flex;
	flex-direction: column;
	gap: 6px;
	align-items: flex-start;
}

.flabel {
	font-size: 9px;
	color: var(--text-muted-on-light);
}

.stats {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
	gap: var(--space-4);
}

.stat {
	padding: 18px 20px;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.stat-num {
	font-family: var(--font-head);
	font-weight: 900;
	font-size: 2rem;
	line-height: 1;
	color: var(--color-ink);
}

.stat-label {
	font-size: 9px;
	color: var(--text-muted-on-light);
}

.charts {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: var(--space-4);
}

.chart-card {
	padding: 20px;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.chart-card.wide {
	grid-column: 1 / -1;
}

.chart-title {
	font-size: var(--fs-md);
}

.chart-desc {
	margin: 0 0 10px;
}

.canvas-wrap {
	position: relative;
	height: 260px;
}

.canvas-wrap.tall {
	height: 320px;
}

.banner {
	background: color-mix(in srgb, var(--lamp-trash) 10%, var(--surface));
	color: var(--lamp-trash);
	border: 1px solid color-mix(in srgb, var(--lamp-trash) 30%, transparent);
	border-radius: var(--radius-sm);
	padding: 12px 14px;
	font-size: var(--fs-sm);
	font-weight: 600;
}

@media (max-width: 720px) {
	.charts {
		grid-template-columns: 1fr;
	}
}
</style>
