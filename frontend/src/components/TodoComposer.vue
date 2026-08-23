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
	<form class="composer" :class="{ busy }" @submit.prevent="submit">
		<span class="plus" aria-hidden="true">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
		</span>

		<input
			v-model="title"
			class="field focusable"
			type="text"
			placeholder="Adicionar uma tarefa e pressionar Enter…"
			aria-label="Nova tarefa"
			:disabled="busy"
		/>

		<button class="add-btn" type="submit" :disabled="!canAdd">
			<v-icon v-if="busy" icon="mdi-loading" size="16" class="spin" />
			<v-icon v-else icon="mdi-plus" size="16" />
			<span class="lbl">Adicionar</span>
		</button>
	</form>
</template>

<style scoped>
.composer {
	display: flex;
	gap: 10px;
	align-items: center;
	background: var(--surface);
	border: 1px solid var(--border);
	border-radius: var(--radius);
	padding: 8px 8px 8px 16px;
	box-shadow: var(--shadow-1);
	margin: 24px 0 18px;
	transition: border-color 0.2s, box-shadow 0.2s;
}

.composer:focus-within {
	border-color: var(--accent);
	box-shadow: var(--shadow-1), 0 0 0 3px var(--accent-ring);
}

.plus {
	color: var(--text-3);
	flex: none;
	display: grid;
	place-items: center;
}

.field {
	flex: 1;
	min-width: 0;
	border: 0;
	background: transparent;
	color: var(--text);
	font: inherit;
	font-size: 15.5px;
	font-weight: 500;
	padding: 9px 0;
}

.field::placeholder {
	color: var(--text-3);
}

.field:focus {
	outline: none;
	box-shadow: none;
}

.add-btn {
	flex: none;
	height: 42px;
	padding: 0 18px;
	border-radius: 11px;
	border: 0;
	background: linear-gradient(150deg, var(--accent), var(--accent-strong));
	color: #fff;
	font: inherit;
	font-weight: 700;
	font-size: 14px;
	cursor: pointer;
	letter-spacing: -0.01em;
	display: inline-flex;
	align-items: center;
	gap: 7px;
	box-shadow: 0 6px 16px -8px var(--accent-ring);
	transition: transform 0.16s var(--ease-out), filter 0.16s, opacity 0.16s;
}

.add-btn:hover:not(:disabled) {
	transform: translateY(-1px);
	filter: brightness(1.06);
}

.add-btn:active:not(:disabled) {
	transform: translateY(0);
}

.add-btn:disabled {
	opacity: 0.45;
	cursor: not-allowed;
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
		padding: 0 13px;
	}
}
</style>
