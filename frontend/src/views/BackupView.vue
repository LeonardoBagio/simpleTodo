<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import { fmtDate } from '../utils/states';

const loading = ref(true);
const error = ref('');
const notice = ref('');
const configured = ref(false);
const backups = ref([]);

const configuring = ref(false);
const creating = ref(false);
const restoring = ref(false);

const dialog = ref(false);
const selected = ref('');

const lastBackup = computed(() => backups.value[0] || null);
const busy = computed(() => configuring.value || creating.value || restoring.value);

function fmtSize(bytes) {
	if (!bytes && bytes !== 0) return '';
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function load() {
	loading.value = true;
	error.value = '';
	try {
		const data = await api.backups.status();
		configured.value = data.configured;
		backups.value = data.backups || [];
	} catch (e) {
		error.value = 'Não foi possível carregar o estado dos backups.';
	} finally {
		loading.value = false;
	}
}

async function configure() {
	configuring.value = true;
	error.value = '';
	notice.value = '';
	try {
		const data = await api.backups.configure();
		configured.value = data.configured;
		backups.value = data.backups || [];
		notice.value = 'Backup configurado. Guarde a chave (backups/.key) em local seguro.';
	} catch (e) {
		error.value = 'Não foi possível configurar o backup.';
	} finally {
		configuring.value = false;
	}
}

async function createBackup() {
	creating.value = true;
	error.value = '';
	notice.value = '';
	try {
		const entry = await api.backups.create();
		backups.value = [entry, ...backups.value.filter((b) => b.name !== entry.name)];
		notice.value = `Backup gerado: ${entry.name}`;
	} catch (e) {
		error.value = e?.response?.data?.message || 'Não foi possível gerar o backup.';
	} finally {
		creating.value = false;
	}
}

function openRestore() {
	selected.value = lastBackup.value ? lastBackup.value.name : '';
	dialog.value = true;
}

async function confirmRestore() {
	if (!selected.value) return;
	restoring.value = true;
	error.value = '';
	notice.value = '';
	try {
		const result = await api.backups.restore(selected.value);
		dialog.value = false;
		notice.value = `Restauração concluída (${result.restored} documento(s)).`;
	} catch (e) {
		error.value = e?.response?.data?.message || 'Não foi possível restaurar o backup.';
	} finally {
		restoring.value = false;
	}
}

onMounted(load);
</script>

<template>
	<div class="backup">
		<header class="head">
			<h1 class="section-title title">Backup</h1>
			<span class="divider"></span>
			<p class="section-desc">
				Backups criptografados (AES-256) do banco. Os arquivos ficam em
				<code>backups/</code> e são gerados tanto por esta tela quanto pelos comandos
				<code>just</code> — ambos usam a mesma engine.
			</p>
		</header>

		<v-expand-transition>
			<div v-if="error" class="banner banner-error" role="alert">
				<v-icon icon="mdi-alert-circle-outline" size="18" />
				<span>{{ error }}</span>
				<button class="banner-close" type="button" aria-label="Dispensar" @click="error = ''">
					<v-icon icon="mdi-close" size="16" />
				</button>
			</div>
		</v-expand-transition>

		<v-expand-transition>
			<div v-if="notice" class="banner banner-ok" role="status">
				<v-icon icon="mdi-check-circle-outline" size="18" />
				<span>{{ notice }}</span>
				<button class="banner-close" type="button" aria-label="Dispensar" @click="notice = ''">
					<v-icon icon="mdi-close" size="16" />
				</button>
			</div>
		</v-expand-transition>

		<section class="card status-card">
			<div class="status-head">
				<span class="eyebrow flabel">Estado</span>
				<span
					class="chip"
					:class="configured ? 'chip-ok' : 'chip-off'"
				>
					<v-icon
						:icon="configured ? 'mdi-shield-check-outline' : 'mdi-shield-alert-outline'"
						size="15"
					/>
					{{ configured ? 'Configurado' : 'Não configurado' }}
				</span>
			</div>

			<div class="status-body">
				<div class="last">
					<span class="eyebrow flabel">Último backup</span>
					<template v-if="loading">
						<span class="last-value muted">Carregando…</span>
					</template>
					<template v-else-if="lastBackup">
						<span class="last-value">{{ fmtDate(lastBackup.createdAt) }}</span>
						<span class="last-meta num">{{ lastBackup.name }} · {{ fmtSize(lastBackup.size) }}</span>
					</template>
					<template v-else>
						<span class="last-value muted">
							{{ configured ? 'Nenhum backup ainda' : 'Não configurado' }}
						</span>
					</template>
				</div>

				<div class="status-actions">
					<button
						v-if="!configured"
						class="btn btn-primary"
						type="button"
						:disabled="busy || loading"
						@click="configure"
					>
						<v-icon icon="mdi-key-outline" size="16" />
						{{ configuring ? 'Configurando…' : 'Configurar backup' }}
					</button>

					<button
						v-else
						class="btn btn-primary"
						type="button"
						:disabled="busy"
						@click="createBackup"
					>
						<v-icon icon="mdi-database-arrow-down-outline" size="16" />
						{{ creating ? 'Gerando…' : 'Fazer backup' }}
					</button>

					<button
						class="btn btn-outline"
						type="button"
						:disabled="busy || backups.length === 0"
						@click="openRestore"
					>
						<v-icon icon="mdi-database-arrow-up-outline" size="16" />
						Restaurar backup
					</button>
				</div>
			</div>

			<p class="key-warn">
				<v-icon icon="mdi-alert-outline" size="16" />
				<span>
					Guarde <code>backups/.key</code> em local seguro. Sem essa chave é
					impossível restaurar os backups.
				</span>
			</p>
		</section>

		<v-dialog v-model="dialog" max-width="560">
			<div class="card dialog">
				<header class="dialog-head">
					<h2 class="section-title dialog-title">Restaurar backup</h2>
					<button class="icon-btn" type="button" aria-label="Fechar" @click="dialog = false">
						<v-icon icon="mdi-close" size="18" />
					</button>
				</header>

				<div class="dialog-warn">
					<v-icon icon="mdi-alert-outline" size="18" />
					<span>A restauração <strong>substitui</strong> os dados atuais do banco pelos do backup escolhido.</span>
				</div>

				<ul class="restore-list">
					<li v-for="b in backups" :key="b.name">
						<label class="restore-item" :class="{ picked: selected === b.name }">
							<input
								class="radio"
								type="radio"
								name="backup"
								:value="b.name"
								v-model="selected"
							/>
							<span class="restore-main">
								<span class="restore-date">{{ fmtDate(b.createdAt) }}</span>
								<span class="restore-name num">{{ b.name }}</span>
							</span>
							<span class="restore-size num">{{ fmtSize(b.size) }}</span>
						</label>
					</li>
					<li v-if="backups.length === 0" class="empty section-desc">
						Nenhum backup disponível.
					</li>
				</ul>

				<div class="dialog-actions">
					<button class="btn btn-outline" type="button" @click="dialog = false">Cancelar</button>
					<button
						class="btn btn-primary"
						type="button"
						:disabled="!selected || restoring"
						@click="confirmRestore"
					>
						<v-icon icon="mdi-database-arrow-up-outline" size="16" />
						{{ restoring ? 'Restaurando…' : 'Restaurar' }}
					</button>
				</div>
			</div>
		</v-dialog>
	</div>
</template>

<style scoped>
.backup {
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

code {
	font-family: var(--font-head);
	font-size: 0.85em;
	background: var(--bg-light);
	padding: 1px 6px;
	border-radius: 6px;
}

.flabel {
	font-size: 9px;
	color: var(--text-muted-on-light);
}

.status-card {
	padding: 20px;
	display: flex;
	flex-direction: column;
	gap: 18px;
}

.status-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.chip {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-family: var(--font-head);
	font-weight: 700;
	font-size: 11px;
	letter-spacing: 0.04em;
	text-transform: uppercase;
	padding: 5px 11px;
	border-radius: 999px;
}

.chip-ok {
	background: color-mix(in srgb, #2f9e44 12%, transparent);
	color: #2f9e44;
}

.chip-off {
	background: color-mix(in srgb, var(--lamp-trash) 12%, transparent);
	color: var(--lamp-trash);
}

.status-body {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 16px;
	flex-wrap: wrap;
}

.last {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.last-value {
	font-family: var(--font-head);
	font-weight: 700;
	font-size: 1.1rem;
	color: var(--color-ink);
}

.last-value.muted {
	color: var(--text-muted-on-light);
	font-weight: 600;
}

.last-meta {
	font-size: 11px;
	color: var(--text-muted-on-light);
}

.status-actions {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}

.key-warn {
	display: flex;
	align-items: center;
	gap: 10px;
	margin: 0;
	padding: 11px 14px;
	background: color-mix(in srgb, var(--lamp-trash) 8%, var(--surface));
	color: var(--lamp-trash);
	border: 1px solid color-mix(in srgb, var(--lamp-trash) 26%, transparent);
	border-radius: var(--radius-sm);
	font-size: var(--fs-sm);
	font-weight: 600;
}

.key-warn code {
	background: color-mix(in srgb, var(--lamp-trash) 12%, transparent);
	color: inherit;
}

.icon-btn {
	width: 34px;
	height: 34px;
	flex: none;
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
	background: var(--surface);
	color: var(--color-ink);
}

.dialog {
	padding: 20px;
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.dialog-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.dialog-title {
	font-size: 1.3rem;
}

.dialog-warn {
	display: flex;
	align-items: center;
	gap: 10px;
	background: color-mix(in srgb, var(--lamp-trash) 10%, var(--surface));
	color: var(--lamp-trash);
	border: 1px solid color-mix(in srgb, var(--lamp-trash) 30%, transparent);
	border-radius: var(--radius-sm);
	padding: 11px 14px;
	font-size: var(--fs-sm);
	font-weight: 600;
}

.restore-list {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 8px;
	max-height: 320px;
	overflow-y: auto;
}

.restore-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 11px 14px;
	border: 1px solid var(--border-subtle);
	border-radius: var(--radius-sm);
	cursor: pointer;
	transition: border-color 0.16s, background 0.16s;
}

.restore-item:hover {
	background: var(--bg-light);
}

.restore-item.picked {
	border-color: var(--color-ink);
	background: var(--bg-light);
}

.radio {
	flex: none;
	accent-color: var(--color-ink);
	width: 16px;
	height: 16px;
}

.restore-main {
	display: flex;
	flex-direction: column;
	gap: 2px;
	flex: 1;
	min-width: 0;
}

.restore-date {
	font-family: var(--font-head);
	font-weight: 700;
	font-size: 13px;
	color: var(--color-ink);
}

.restore-name {
	font-size: 11px;
	color: var(--text-muted-on-light);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.restore-size {
	font-size: 11px;
	color: var(--text-muted-on-light);
	flex: none;
}

.dialog-actions {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
}

.empty {
	padding: 14px;
	text-align: center;
}

.banner {
	display: flex;
	align-items: center;
	gap: 10px;
	border-radius: var(--radius-sm);
	padding: 11px 12px 11px 14px;
	font-size: var(--fs-sm);
	font-weight: 600;
}

.banner span {
	flex: 1;
}

.banner-error {
	background: color-mix(in srgb, var(--lamp-trash) 10%, var(--surface));
	color: var(--lamp-trash);
	border: 1px solid color-mix(in srgb, var(--lamp-trash) 30%, transparent);
}

.banner-ok {
	background: color-mix(in srgb, #2f9e44 10%, var(--surface));
	color: #2f9e44;
	border: 1px solid color-mix(in srgb, #2f9e44 30%, transparent);
}

.banner-close {
	flex: none;
	border: 0;
	background: transparent;
	color: inherit;
	cursor: pointer;
	display: grid;
	place-items: center;
	border-radius: 7px;
	width: 26px;
	height: 26px;
}
</style>
