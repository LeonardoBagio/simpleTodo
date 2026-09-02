<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCatalog } from '../stores/catalog';
import { GROUP_ORDER, GROUP_LABEL, GROUP_OPTIONS } from '../utils/states';
import StatusBadge from '../components/StatusBadge.vue';

const catalog = useCatalog();

const label = ref('');
const color = ref('#4a9fd4');
const group = ref('a_fazer');
const editingId = ref(null);
const saving = ref(false);
const error = ref('');

const isEdit = computed(() => !!editingId.value);
const canSave = computed(() => label.value.trim().length > 0 && !saving.value);

const grouped = computed(() =>
	GROUP_ORDER.map((g) => ({
		group: g,
		label: GROUP_LABEL[g],
		items: catalog.state.statuses.filter((s) => s.group === g),
	})),
);

function reset() {
	label.value = '';
	color.value = '#4a9fd4';
	group.value = 'a_fazer';
	editingId.value = null;
}

function startEdit(s) {
	editingId.value = s._id;
	label.value = s.label;
	color.value = s.color;
	group.value = s.group;
}

function nextOrder(g) {
	const items = catalog.state.statuses;
	const max = items.reduce((m, s) => Math.max(m, s.sortOrder ?? 0), 0);
	return max + 1;
}

async function save() {
	if (!canSave.value) return;
	saving.value = true;
	error.value = '';
	try {
		const payload = { label: label.value.trim(), color: color.value, group: group.value };
		if (!editingId.value) payload.sortOrder = nextOrder(group.value);
		await catalog.saveStatus(payload, editingId.value);
		reset();
	} catch (e) {
		error.value = 'Não foi possível salvar o status.';
	} finally {
		saving.value = false;
	}
}

async function remove(s) {
	if (!confirm(`Excluir o status "${s.label}"? As tarefas nele ficarão sem andamento.`)) return;
	error.value = '';
	try {
		await catalog.removeStatus(s._id);
		if (editingId.value === s._id) reset();
	} catch (e) {
		error.value = 'Não foi possível excluir o status.';
	}
}

onMounted(() => catalog.fetchAll());
</script>

<template>
	<div class="cadastro">
		<header class="head">
			<h1 class="section-title title">Status</h1>
			<span class="divider"></span>
			<p class="section-desc">
				Cadastro de andamentos. Cada status pertence a um dos três grupos PRIME e tem uma cor.
			</p>
		</header>

		<form class="form card" @submit.prevent="save">
			<div class="form-row">
				<label class="field-group grow">
					<span class="flabel eyebrow">Nome</span>
					<input v-model="label" class="field" type="text" placeholder="Ex.: Code-review" maxlength="40" />
				</label>
				<label class="field-group">
					<span class="flabel eyebrow">Cor</span>
					<span class="color-input">
						<input v-model="color" type="color" class="swatch" aria-label="Cor" />
						<input v-model="color" class="field hex" type="text" maxlength="9" />
					</span>
				</label>
			</div>

			<div class="field-group">
				<span class="flabel eyebrow">Grupo</span>
				<div class="segment" role="group" aria-label="Grupo do status">
					<button
						v-for="opt in GROUP_OPTIONS"
						:key="opt.value"
						type="button"
						class="seg-btn"
						:class="{ active: group === opt.value }"
						:aria-pressed="group === opt.value"
						@click="group = opt.value"
					>
						{{ opt.label }}
					</button>
				</div>
			</div>

			<div class="preview">
				<span class="eyebrow flabel">Prévia</span>
				<StatusBadge :status="{ color, label: label || 'status' }" />
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

		<div class="groups">
			<section v-for="g in grouped" :key="g.group" class="grp">
				<h2 class="grp-title eyebrow">{{ g.label }}</h2>
				<ul class="list">
					<li v-for="s in g.items" :key="s._id" class="row card">
						<StatusBadge :status="s" />
						<span class="hexcode num">{{ s.color }}</span>
						<div class="row-actions">
							<button class="icon-btn" type="button" title="Editar" @click="startEdit(s)">
								<v-icon icon="mdi-pencil-outline" size="16" />
							</button>
							<button class="icon-btn danger" type="button" title="Excluir" @click="remove(s)">
								<v-icon icon="mdi-trash-can-outline" size="16" />
							</button>
						</div>
					</li>
					<li v-if="g.items.length === 0" class="empty section-desc">Nenhum status neste grupo.</li>
				</ul>
			</section>
		</div>
	</div>
</template>

<style scoped>
.cadastro {
	display: flex;
	flex-direction: column;
	gap: 24px;
	max-width: 760px;
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

.groups {
	display: flex;
	flex-direction: column;
	gap: 22px;
}

.grp-title {
	font-size: 10px;
	color: var(--text-muted-on-light);
	margin-bottom: 10px;
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
	padding: 14px;
	text-align: center;
}
</style>
