<script setup>
import { computed } from 'vue';

const props = defineProps({
	filter: { type: String, default: 'all' },
});

const copy = computed(() => {
	if (props.filter === 'done') {
		return { title: 'Nada concluído ainda', text: 'Conclua uma tarefa para vê-la aqui.' };
	}
	if (props.filter === 'active') {
		return { title: 'Tudo em dia', text: 'Você não tem tarefas pendentes.' };
	}
	return {
		title: 'Comece adicionando uma tarefa',
		text: 'Escreva o que precisa fazer no campo acima.',
	};
});
</script>

<template>
	<div class="empty">
		<div class="ill" aria-hidden="true">
			<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
				<path d="M9 11l3 3 8-8" />
				<path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
			</svg>
		</div>
		<h3>{{ copy.title }}</h3>
		<p>{{ copy.text }}</p>
	</div>
</template>

<style scoped>
.empty {
	padding: 54px 24px;
	text-align: center;
}

.ill {
	width: 60px;
	height: 60px;
	border-radius: 18px;
	background: var(--accent-weak);
	color: var(--accent);
	display: grid;
	place-items: center;
	margin: 0 auto 18px;
}

h3 {
	font-size: 17px;
	font-weight: 800;
	letter-spacing: -0.02em;
	color: var(--text);
}

p {
	color: var(--text-2);
	font-size: 14px;
	margin-top: 6px;
	font-weight: 500;
}
</style>
