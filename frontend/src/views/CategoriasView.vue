<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCatalog } from '../stores/catalog';

const catalog = useCatalog();

const label = ref('');
const color = ref('#4a9fd4');
const editingId = ref(null);
const saving = ref(false);
const error = ref('');

const categories = computed(() => catalog.state.categories);
const isEdit = computed(() => !!editingId.value);
const canSave = computed(() => label.value.trim().length > 0 && !saving.value);

function reset() {
	label.value = '';
	color.value = '#4a9fd4';
	editingId.value = null;
}

function startEdit(cat) {
	editingId.value = cat._id;
	label.value = cat.label;
	color.value = cat.color;
}

async function save() {
	if (!canSave.value) return;
	saving.value = true;
	error.value = '';
	try {
		await catalog.saveCategory(
			{ label: label.value.trim(), color: color.value },
			editingId.value,
		);
		reset();
	} catch (e) {
		error.value = 'Não foi possível salvar a categoria.';
	} finally {
		saving.value = false;
	}
}

async function remove(cat) {
	if (!confirm(`Excluir a categoria "${cat.label}"?`)) return;
	error.value = '';
	try {
		await catalog.removeCategory(cat._id);
		if (editingId.value === cat._id) reset();
	} catch (e) {
		error.value = 'Não foi possível excluir a categoria.';
	}
}

onMounted(() => catalog.fetchAll());
</script>

<template>
	<div class="cadastro">
		<header class="head">
			<h1 class="section-title title">Categoria</h1>
			<span class="divider"></span>
			<p class="section-desc">Cadastro de categorias das tarefas. Defina o nome e a cor.</p>
		</header>

		<form class="form card" @submit.prevent="save">
			<div class="form-row">
				<label class="field-group grow">
					<span class="flabel eyebrow">Nome</span>
					<input v-model="label" class="field" type="text" placeholder="Ex.: feature" maxlength="40" />
				</label>
				<label class="field-group">
					<span class="flabel eyebrow">Cor</span>
					<span class="color-input">
						<input v-model="color" type="color" class="swatch" aria-label="Cor" />
						<input v-model="color" class="field hex" type="text" maxlength="9" />
					</span>
				</label>
			</div>

			<div class="preview">
				<span class="eyebrow flabel">Prévia</span>
				<span class="cat-pill" :style="{ background: color }">{{ label || 'categoria' }}</span>
			</div>

			<div class="form-actions">
				<button v-if="isEdit" class="btn btn-outline" type="button" @click="reset">Cancelar</button>
				<button class="btn btn-primary" type="submit" :disabled="!canSave">
					<v-icon :icon="isEdit ? 'mdi-content-save-outline' : 'mdi-plus'" size="16" />
					{{ isEdit ? 'Salvar' : 'Adicionar' }}
				</button>
			</div>
		</form>

		<v-expand-transition>
			<div v-if="error" class="banner" role="alert">
				<v-icon icon="mdi-alert-circle-outline" size="18" />
				<span>{{ error }}</span>
				<button class="banner-close" type="button" aria-label="Dispensar" @click="error = ''">
					<v-icon icon="mdi-close" size="16" />
				</button>
			</div>
		</v-expand-transition>

		<ul class="list">
			<li v-for="c in categories" :key="c._id" class="row card">
				<span class="cat-pill" :style="{ background: c.color }">{{ c.label }}</span>
				<span class="hexcode num">{{ c.color }}</span>
				<div class="row-actions">
					<button class="icon-btn" type="button" title="Editar" @click="startEdit(c)">
						<v-icon icon="mdi-pencil-outline" size="16" />
					</button>
					<button class="icon-btn danger" type="button" title="Excluir" @click="remove(c)">
						<v-icon icon="mdi-trash-can-outline" size="16" />
					</button>
				</div>
			</li>
			<li v-if="categories.length === 0" class="empty section-desc">Nenhuma categoria cadastrada.</li>
		</ul>
	</div>
</template>

<style scoped>
.cadastro {
	display: flex;
	flex-direction: column;
	gap: 24px;
	max-width: 720px;
}

.head {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.title {
	font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.2rem);
}

.form {
	padding: 20px;
	display: flex;
	flex-direction: column;
	gap: 18px;
}

.form-row {
	display: flex;
	gap: 14px;
	flex-wrap: wrap;
}

.color-input {
	display: flex;
	align-items: center;
	gap: 8px;
}

.swatch {
	width: 42px;
	height: 42px;
	padding: 0;
	border: 1px solid var(--border-strong);
	border-radius: var(--radius-sm);
	background: none;
	cursor: pointer;
}

.hex {
	width: 110px;
	font-family: var(--font-head);
}

.preview {
	display: flex;
	align-items: center;
	gap: 12px;
}

.form-actions {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
}

.list {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.row {
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 12px 16px;
}

.hexcode {
	font-family: var(--font-head);
	font-size: 12px;
	color: var(--text-muted-on-light);
}

.row-actions {
	margin-left: auto;
	display: flex;
	gap: 4px;
}

.empty {
	padding: 20px;
	text-align: center;
}

</style>
