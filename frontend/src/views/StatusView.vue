<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCatalog } from '../stores/catalog';
import { GROUP_ORDER, GROUP_LABEL, GROUP_OPTIONS } from '../utils/states';
import StatusBadge from '../components/StatusBadge.vue';

const catalog = useCatalog();

const label = ref('');
const color = ref('#337ea9');
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
	color.value = '#337ea9';
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
				<div class="segmented">
					<button
						v-for="opt in GROUP_OPTIONS"
						:key="opt.value"
						type="button"
						class="seg"
						:class="{ active: group === opt.value }"
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

		<div v-if="error" class="banner">{{ error }}</div>

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

.field-group {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.field-group.grow {
	flex: 1;
	min-width: 200px;
}

.flabel {
	font-size: 9px;
	color: var(--text-muted-on-light);
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

.segmented {
	display: inline-flex;
	gap: 4px;
	background: var(--bg-light);
	border-radius: var(--radius-pill);
	padding: 4px;
	width: fit-content;
}

.seg {
	border: 0;
	background: transparent;
	border-radius: var(--radius-pill);
	padding: 0.5rem 1rem;
	font-family: var(--font-head);
	font-weight: 700;
	font-size: var(--fs-xs);
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: var(--text-muted-on-light);
	cursor: pointer;
	transition: background 0.18s, color 0.18s;
}

.seg.active {
	background: var(--color-ink);
	color: var(--color-white);
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

.icon-btn {
	width: 34px;
	height: 34px;
	border-radius: var(--radius-sm);
	border: 0;
	background: transparent;
	color: var(--text-muted-on-light);
	cursor: pointer;
	display: grid;
	place-items: center;
	transition: background 0.16s, color 0.16s;
}

.icon-btn:hover {
	background: var(--bg-light);
	color: var(--color-ink);
}

.icon-btn.danger:hover {
	background: color-mix(in srgb, var(--lamp-trash) 12%, transparent);
	color: var(--lamp-trash);
}

.empty {
	padding: 14px;
	text-align: center;
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
</style>
