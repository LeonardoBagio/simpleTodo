<script setup>
import { ref, computed, watch } from 'vue';
import StateSelect from './StateSelect.vue';
import CategorySelect from './CategorySelect.vue';

const props = defineProps({
	editing: { type: Object, default: null },
	busy: { type: Boolean, default: false },
});
const emit = defineEmits(['create', 'update', 'cancel']);

const title = ref('');
const statusId = ref(null);
const categoryId = ref(null);

const isEdit = computed(() => !!props.editing);
const canSave = computed(() => title.value.trim().length > 0 && !props.busy);

watch(
	() => props.editing,
	(t) => {
		title.value = t?.title ?? '';
		statusId.value = t?.status?._id ?? null;
		categoryId.value = t?.category?._id ?? null;
	},
	{ immediate: true },
);

function submit() {
	const value = title.value.trim();
	if (!value || props.busy) return;
	const payload = { title: value, status: statusId.value, category: categoryId.value };
	if (isEdit.value) emit('update', { id: props.editing._id, ...payload });
	else emit('create', payload);
	if (!isEdit.value) {
		title.value = '';
		statusId.value = null;
		categoryId.value = null;
	}
}
</script>

<template>
	<form class="composer card" @submit.prevent="submit">
		<div class="row-top">
			<span class="lead-icon" aria-hidden="true">
				<v-icon :icon="isEdit ? 'mdi-pencil-outline' : 'mdi-plus'" size="18" />
			</span>
			<input
				v-model="title"
				class="field with-icon"
				type="text"
				:placeholder="isEdit ? 'Editar título da tarefa…' : 'Descreva a nova tarefa…'"
				aria-label="Título da tarefa"
				:disabled="busy"
				@keydown.enter.prevent="submit"
			/>
		</div>

		<div class="row-controls">
			<div class="selects">
				<StateSelect v-model="statusId" all-label="Sem Andamento" placeholder="Sem Andamento" />
				<CategorySelect v-model="categoryId" all-label="Sem categoria" />
			</div>

			<div class="buttons">
				<button v-if="isEdit" class="btn btn-outline" type="button" @click="emit('cancel')">
					Cancelar
				</button>
				<button class="btn btn-primary" type="submit" :disabled="!canSave">
					<v-icon v-if="busy" icon="mdi-loading" size="16" class="spin" />
					<v-icon v-else :icon="isEdit ? 'mdi-content-save-outline' : 'mdi-plus'" size="16" />
					<span>{{ isEdit ? 'Salvar' : 'Adicionar' }}</span>
				</button>
			</div>
		</div>
	</form>
</template>

<style scoped>
.composer {
	display: flex;
	flex-direction: column;
	gap: 14px;
	padding: 16px;
}

.row-top {
	position: relative;
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

.row-controls {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	flex-wrap: wrap;
}

.selects {
	display: flex;
	gap: 10px;
	flex-wrap: wrap;
}

.buttons {
	display: flex;
	gap: 8px;
}

.spin {
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
