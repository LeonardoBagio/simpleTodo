<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
	busy: { type: Boolean, default: false },
});
const emit = defineEmits(['add']);

const title = ref('');
const canAdd = computed(() => title.value.trim().length > 0 && !props.busy);

function submit() {
	const value = title.value.trim();
	if (!value || props.busy) return;
	emit('add', value);
	title.value = '';
}
</script>

<template>
	<form class="composer card" @submit.prevent="submit">
		<div class="input-wrap">
			<span class="lead-icon" aria-hidden="true">
				<v-icon icon="mdi-plus" size="18" />
			</span>
			<input
				v-model="title"
				class="field with-icon"
				type="text"
				placeholder="Descreva a nova tarefa e pressione Enter…"
				aria-label="Nova tarefa"
				:disabled="busy"
			/>
		</div>

		<button class="btn btn-primary add-btn" type="submit" :disabled="!canAdd">
			<v-icon v-if="busy" icon="mdi-loading" size="16" class="spin" />
			<v-icon v-else icon="mdi-plus" size="16" />
			<span class="lbl">Adicionar</span>
		</button>
	</form>
</template>

<style scoped>
.composer {
	display: flex;
	gap: 12px;
	align-items: center;
	padding: 12px;
}

.input-wrap {
	position: relative;
	flex: 1;
	min-width: 0;
}

.lead-icon {
	position: absolute;
	left: 12px;
	top: 50%;
	transform: translateY(-50%);
	color: var(--text-muted-on-light);
	display: grid;
	place-items: center;
	pointer-events: none;
}

.field.with-icon {
	padding-left: 38px;
}

.add-btn {
	flex: none;
}

.spin {
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

@media (max-width: 520px) {
	.lbl {
		display: none;
	}
	.add-btn {
		padding: 0.62rem 0.9rem;
	}
}
</style>
