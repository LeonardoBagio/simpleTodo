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

const remoteConfigured = ref(false);
const remoteName = ref('');
const pushing = ref(false);

const remoteDialog = ref(false);
const tokenInput = ref('');
const savingRemote = ref(false);
const copied = ref(false);

const authCommand = 'docker run --rm -it --network host rclone/rclone authorize "drive"';

const schedule = ref({
	enabled: false,
	frequency: 'daily',
	time: '02:00',
	dayOfWeek: 0,
	push: true,
});
const scheduleInfo = ref({ nextRun: null, lastRun: null, lastStatus: null, lastError: null });
const savingSchedule = ref(false);

const frequencyOptions = [
	{ value: 'hourly', label: 'A cada hora' },
	{ value: 'daily', label: 'Diário' },
	{ value: 'weekly', label: 'Semanal' },
];
const weekdays = [
	'Domingo',
	'Segunda',
	'Terça',
	'Quarta',
	'Quinta',
	'Sexta',
	'Sábado',
];

const lastBackup = computed(() => backups.value[0] || null);
const busy = computed(
	() => configuring.value || creating.value || restoring.value || pushing.value,
);

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
		const [data, remote, sched] = await Promise.all([
			api.backups.status(),
			api.backups.remoteStatus().catch(() => ({ configured: false, remote: '' })),
			api.backups.schedule().catch(() => null),
		]);
		configured.value = data.configured;
		backups.value = data.backups || [];
		remoteConfigured.value = remote.configured;
		remoteName.value = remote.remote || '';
		if (sched) applySchedule(sched);
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

async function copyCommand() {
	try {
		await navigator.clipboard.writeText(authCommand);
		copied.value = true;
		setTimeout(() => (copied.value = false), 1500);
	} catch {
		copied.value = false;
	}
}

function openRemoteConfig() {
	tokenInput.value = '';
	remoteDialog.value = true;
}

async function saveRemote() {
	if (!tokenInput.value.trim()) return;
	savingRemote.value = true;
	error.value = '';
	notice.value = '';
	try {
		const data = await api.backups.configureRemote(tokenInput.value.trim());
		remoteConfigured.value = data.configured;
		remoteName.value = data.remote || remoteName.value;
		remoteDialog.value = false;
		notice.value = 'Nuvem configurada. Já pode enviar os backups.';
	} catch (e) {
		error.value = e?.response?.data?.message || 'Não foi possível configurar a nuvem.';
	} finally {
		savingRemote.value = false;
	}
}

function applySchedule(data) {
	schedule.value = {
		enabled: data.enabled,
		frequency: data.frequency,
		time: data.time,
		dayOfWeek: data.dayOfWeek,
		push: data.push,
	};
	scheduleInfo.value = {
		nextRun: data.nextRun,
		lastRun: data.lastRun,
		lastStatus: data.lastStatus,
		lastError: data.lastError,
	};
}

async function saveSchedule() {
	savingSchedule.value = true;
	error.value = '';
	notice.value = '';
	try {
		const data = await api.backups.saveSchedule(schedule.value);
		applySchedule(data);
		notice.value = data.enabled
			? 'Agendamento salvo.'
			: 'Agendamento desativado.';
	} catch (e) {
		error.value = e?.response?.data?.message || 'Não foi possível salvar o agendamento.';
	} finally {
		savingSchedule.value = false;
	}
}

async function pushToCloud() {
	pushing.value = true;
	error.value = '';
	notice.value = '';
	try {
		const result = await api.backups.push();
		const count = result.remoteCount;
		notice.value =
			count == null
				? 'Backups enviados para a nuvem.'
				: `Backups enviados para a nuvem (${count} na nuvem).`;
	} catch (e) {
		error.value = e?.response?.data?.message || 'Não foi possível enviar para a nuvem.';
	} finally {
		pushing.value = false;
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

		<section class="card status-card">
			<div class="status-head">
				<span class="eyebrow flabel">Nuvem (rclone)</span>
				<span class="chip" :class="remoteConfigured ? 'chip-ok' : 'chip-off'">
					<v-icon
						:icon="remoteConfigured ? 'mdi-cloud-check-outline' : 'mdi-cloud-off-outline'"
						size="15"
					/>
					{{ remoteConfigured ? 'Configurado' : 'Não configurado' }}
				</span>
			</div>

			<div class="status-body">
				<div class="last">
					<span class="eyebrow flabel">Destino</span>
					<template v-if="loading">
						<span class="last-value muted">Carregando…</span>
					</template>
					<template v-else-if="remoteConfigured">
						<span class="last-value num">{{ remoteName }}</span>
						<span class="last-meta">Envia os arquivos .stbackup (a chave nunca vai junto).</span>
					</template>
					<template v-else>
						<span class="last-value muted">Não configurado</span>
					</template>
				</div>

				<div class="status-actions">
					<button
						v-if="!remoteConfigured"
						class="btn btn-primary"
						type="button"
						:disabled="busy || loading"
						@click="openRemoteConfig"
					>
						<v-icon icon="mdi-cloud-cog-outline" size="16" />
						Configurar nuvem
					</button>

					<button
						class="btn"
						:class="remoteConfigured ? 'btn-primary' : 'btn-outline'"
						type="button"
						:disabled="busy || !remoteConfigured || backups.length === 0"
						@click="pushToCloud"
					>
						<v-icon icon="mdi-cloud-upload-outline" size="16" />
						{{ pushing ? 'Enviando…' : 'Enviar para a nuvem' }}
					</button>
				</div>
			</div>

			<p v-if="!remoteConfigured && !loading" class="key-warn key-info">
				<v-icon icon="mdi-information-outline" size="16" />
				<span>
					O login no Google acontece no navegador (um comando único); depois é só
					colar o token na tela em <strong>Configurar nuvem</strong>.
				</span>
			</p>
		</section>

		<section class="card status-card">
			<div class="status-head">
				<span class="eyebrow flabel">Agendamento</span>
				<span class="chip" :class="schedule.enabled ? 'chip-ok' : 'chip-off'">
					<v-icon
						:icon="schedule.enabled ? 'mdi-clock-check-outline' : 'mdi-clock-outline'"
						size="15"
					/>
					{{ schedule.enabled ? 'Ativo' : 'Desativado' }}
				</span>
			</div>

			<div class="sched-form">
				<label class="switch-row">
					<input type="checkbox" class="checkbox" v-model="schedule.enabled" />
					<span>Fazer backup automaticamente</span>
				</label>

				<div class="sched-fields">
					<label class="field-group grow">
						<span class="flabel eyebrow">Frequência</span>
						<select v-model="schedule.frequency" class="field">
							<option v-for="o in frequencyOptions" :key="o.value" :value="o.value">
								{{ o.label }}
							</option>
						</select>
					</label>

					<label v-if="schedule.frequency === 'weekly'" class="field-group grow">
						<span class="flabel eyebrow">Dia da semana</span>
						<select v-model.number="schedule.dayOfWeek" class="field">
							<option v-for="(d, i) in weekdays" :key="i" :value="i">{{ d }}</option>
						</select>
					</label>

					<label class="field-group">
						<span class="flabel eyebrow">
							{{ schedule.frequency === 'hourly' ? 'Minuto (usa só os min.)' : 'Horário' }}
						</span>
						<input type="time" class="field" v-model="schedule.time" />
					</label>
				</div>

				<label class="switch-row">
					<input type="checkbox" class="checkbox" v-model="schedule.push" />
					<span>Enviar para a nuvem após o backup</span>
				</label>

				<p v-if="schedule.push && !remoteConfigured" class="key-warn key-info">
					<v-icon icon="mdi-information-outline" size="16" />
					<span>
						A nuvem ainda não está configurada — o backup será feito, mas o envio é
						ignorado até você configurar a nuvem acima.
					</span>
				</p>

				<div class="sched-foot">
					<div class="sched-status">
						<template v-if="schedule.enabled && scheduleInfo.nextRun">
							<span class="flabel eyebrow">Próxima</span>
							<span class="sched-value">{{ fmtDate(scheduleInfo.nextRun) }}</span>
						</template>
						<template v-if="scheduleInfo.lastRun">
							<span class="flabel eyebrow">Última</span>
							<span class="sched-value">
								{{ fmtDate(scheduleInfo.lastRun) }}
								<span
									class="run-badge"
									:class="scheduleInfo.lastStatus === 'ok' ? 'ok' : 'err'"
								>
									{{ scheduleInfo.lastStatus === 'ok' ? 'ok' : 'falhou' }}
								</span>
							</span>
						</template>
					</div>

					<button
						class="btn btn-primary"
						type="button"
						:disabled="busy || savingSchedule"
						@click="saveSchedule"
					>
						<v-icon icon="mdi-content-save-outline" size="16" />
						{{ savingSchedule ? 'Salvando…' : 'Salvar agendamento' }}
					</button>
				</div>
			</div>
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

		<v-dialog v-model="remoteDialog" max-width="620">
			<div class="card dialog">
				<header class="dialog-head">
					<h2 class="section-title dialog-title">Configurar nuvem</h2>
					<button class="icon-btn" type="button" aria-label="Fechar" @click="remoteDialog = false">
						<v-icon icon="mdi-close" size="18" />
					</button>
				</header>

				<ol class="steps">
					<li>
						<span class="step-label eyebrow">1 · Gerar o token</span>
						<p class="step-desc section-desc">
							Rode o comando abaixo no terminal. Ele abre o navegador para o login no
							Google e, ao final, imprime um token (um JSON).
						</p>
						<div class="cmd-row">
							<code class="cmd">{{ authCommand }}</code>
							<button
								class="icon-btn"
								type="button"
								:title="copied ? 'Copiado!' : 'Copiar'"
								@click="copyCommand"
							>
								<v-icon :icon="copied ? 'mdi-check' : 'mdi-content-copy'" size="16" />
							</button>
						</div>
					</li>
					<li>
						<span class="step-label eyebrow">2 · Colar o token</span>
						<p class="step-desc section-desc">
							Cole aqui o JSON impresso pelo comando (o trecho entre as setas).
						</p>
						<textarea
							v-model="tokenInput"
							class="token-field"
							rows="4"
							placeholder='{"access_token":"...","token_type":"Bearer","refresh_token":"...","expiry":"..."}'
						></textarea>
					</li>
				</ol>

				<div class="dialog-actions">
					<button class="btn btn-outline" type="button" @click="remoteDialog = false">Cancelar</button>
					<button
						class="btn btn-primary"
						type="button"
						:disabled="!tokenInput.trim() || savingRemote"
						@click="saveRemote"
					>
						<v-icon icon="mdi-content-save-outline" size="16" />
						{{ savingRemote ? 'Salvando…' : 'Salvar' }}
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
	background: color-mix(in srgb, var(--lamp-done) 14%, transparent);
	color: color-mix(in srgb, var(--lamp-done) 72%, var(--text-dark));
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

.key-info {
	background: var(--bg-light);
	color: var(--text-muted-on-light);
	border-color: var(--border-subtle);
}

.key-info code {
	background: var(--surface);
	color: var(--color-ink);
}

.sched-form {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.switch-row {
	display: flex;
	align-items: center;
	gap: 10px;
	font-size: var(--fs-sm);
	font-weight: 600;
	color: var(--color-ink);
	cursor: pointer;
}

.checkbox {
	width: 17px;
	height: 17px;
	accent-color: var(--color-ink);
	cursor: pointer;
	flex: none;
}

.sched-fields {
	display: flex;
	gap: 14px;
	flex-wrap: wrap;
}

.sched-foot {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 16px;
	flex-wrap: wrap;
	border-top: 1px solid var(--border-subtle);
	padding-top: 16px;
}

.sched-status {
	display: grid;
	grid-template-columns: auto auto;
	gap: 4px 12px;
	align-items: center;
}

.sched-value {
	font-family: var(--font-head);
	font-weight: 700;
	font-size: 13px;
	color: var(--color-ink);
	display: inline-flex;
	align-items: center;
	gap: 8px;
}

.run-badge {
	font-size: 10px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	padding: 2px 7px;
	border-radius: 999px;
}

.run-badge.ok {
	background: color-mix(in srgb, var(--lamp-done) 16%, transparent);
	color: color-mix(in srgb, var(--lamp-done) 72%, var(--text-dark));
}

.run-badge.err {
	background: color-mix(in srgb, var(--lamp-trash) 14%, transparent);
	color: var(--lamp-trash);
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

.steps {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 18px;
}

.step-label {
	font-size: 10px;
	color: var(--text-muted-on-light);
}

.step-desc {
	margin: 6px 0 8px;
}

.cmd-row {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 12px;
	background: var(--bg-light);
	border-radius: var(--radius-sm);
}

.cmd {
	flex: 1;
	min-width: 0;
	font-family: var(--font-head);
	font-size: 12px;
	font-weight: 700;
	color: var(--color-ink);
	background: none;
	padding: 0;
	overflow-x: auto;
	white-space: nowrap;
}

.token-field {
	width: 100%;
	resize: vertical;
	font-family: var(--font-head);
	font-size: 12px;
	padding: 10px 12px;
	border: 1px solid var(--border-strong);
	border-radius: var(--radius-sm);
	background: var(--surface);
	color: var(--color-ink);
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
</style>
