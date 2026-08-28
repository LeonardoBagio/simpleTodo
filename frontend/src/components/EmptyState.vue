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
		title: 'Sem tarefas ainda',
		text: 'Adicione a primeira tarefa no campo acima para começar.',
	};
});
</script>

<template>
	<div class="empty card">
		<span class="divider"></span>
		<h3 class="section-title etitle">{{ copy.title }}</h3>
		<p class="etext">{{ copy.text }}</p>
	</div>
</template>

<style scoped>
.empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
	padding: 64px 24px;
	text-align: center;
}

.etitle {
	font-size: var(--fs-lg);
}

.etext {
	max-width: 22rem;
	color: var(--text-muted-on-light);
	font-size: var(--fs-sm);
	margin: 0;
}
</style>
