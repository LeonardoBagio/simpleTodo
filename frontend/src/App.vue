<script setup>
import { ref, onMounted } from 'vue';
import { useTheme } from 'vuetify';
import TodoView from './views/TodoView.vue';

const theme = useTheme();
const isDark = ref(false);

function applyTheme(dark) {
	isDark.value = dark;
	theme.global.name.value = dark ? 'dark' : 'light';
}

function toggleTheme() {
	const next = !isDark.value;
	applyTheme(next);
	localStorage.setItem('todo-theme', next ? 'dark' : 'light');
}

onMounted(() => {
	const saved = localStorage.getItem('todo-theme');
	if (saved) {
		applyTheme(saved === 'dark');
	} else {
		applyTheme(window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
	}
});
</script>

<template>
	<v-app>
		<v-main>
			<div class="shell">
				<div class="topbar">
					<div class="brand">
						<span class="mark" aria-hidden="true">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
						</span>
						<span class="name">simple<b>Todo</b></span>
					</div>

					<button
						class="icon-btn focusable"
						type="button"
						:aria-label="isDark ? 'Ativar tema claro' : 'Ativar tema escuro'"
						:title="isDark ? 'Tema claro' : 'Tema escuro'"
						@click="toggleTheme"
					>
						<v-icon :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'" size="20" />
					</button>
				</div>

				<TodoView />

				<p class="pagefoot">simpleTodo · laboratório MEVN</p>
			</div>
		</v-main>
	</v-app>
</template>

<style scoped>
.shell {
	max-width: 680px;
	margin: 0 auto;
	padding: clamp(28px, 6vw, 72px) 20px 96px;
}

.topbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 34px;
}

.brand {
	display: flex;
	align-items: center;
	gap: 11px;
}

.brand .mark {
	width: 34px;
	height: 34px;
	border-radius: 10px;
	display: grid;
	place-items: center;
	background: linear-gradient(150deg, var(--accent), var(--accent-strong));
	box-shadow: 0 6px 16px -6px var(--accent-ring);
	color: #fff;
}

.brand .name {
	font-weight: 800;
	letter-spacing: -0.02em;
	font-size: 15px;
	color: var(--text);
}

.brand .name b {
	color: var(--accent);
}

.icon-btn {
	width: 38px;
	height: 38px;
	border-radius: 11px;
	border: 1px solid var(--border);
	background: var(--surface);
	color: var(--text-2);
	display: grid;
	place-items: center;
	cursor: pointer;
	transition: transform 0.18s var(--ease-out), color 0.18s, border-color 0.18s;
}

.icon-btn:hover {
	color: var(--text);
	border-color: var(--border-strong);
	transform: translateY(-1px);
}

.icon-btn:active {
	transform: translateY(0);
}

.pagefoot {
	text-align: center;
	margin-top: 30px;
	font-size: 12px;
	color: var(--text-3);
	font-weight: 600;
}
</style>
