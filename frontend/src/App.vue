<script setup>
import { onMounted, watchEffect } from 'vue';
import { useTheme as useVuetifyTheme } from 'vuetify';
import Wordmark from './components/Wordmark.vue';
import { useCatalog } from './stores/catalog';
import { useTheme } from './composables/useTheme';

const nav = [
	{ to: '/painel', label: 'Painel', icon: 'mdi-view-dashboard-outline' },
	{ to: '/listagem', label: 'Listagem', icon: 'mdi-format-list-bulleted' },
	{ to: '/dashboard', label: 'Dashboard', icon: 'mdi-chart-box-outline' },
	{ to: '/categorias', label: 'Categoria', icon: 'mdi-tag-multiple-outline' },
	{ to: '/status', label: 'Status', icon: 'mdi-format-list-bulleted-type' },
	{ to: '/backup', label: 'Backup', icon: 'mdi-database-arrow-down-outline' },
];

const catalog = useCatalog();
const { resolved, toggle, apply } = useTheme();
const vuetifyTheme = useVuetifyTheme();

apply();
watchEffect(() => {
	vuetifyTheme.global.name.value =
		resolved.value === 'dark' ? 'portfolioDark' : 'portfolio';
});

onMounted(() => catalog.fetchAll());
</script>

<template>
	<v-app>
		<v-main>
			<div class="layout">
				<aside class="sidebar">
					<div class="brand">
						<Wordmark tone="dark" />
					</div>
					<nav class="menu">
						<RouterLink
							v-for="item in nav"
							:key="item.to"
							:to="item.to"
							class="menu-item"
							active-class="is-active"
							:title="item.label"
							:aria-label="item.label"
						>
							<v-icon :icon="item.icon" size="18" />
							<span>{{ item.label }}</span>
						</RouterLink>
					</nav>

					<button
						class="theme-toggle"
						type="button"
						:aria-label="resolved === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'"
						:title="resolved === 'dark' ? 'Tema claro' : 'Tema escuro'"
						@click="toggle"
					>
						<v-icon
							:icon="resolved === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
							size="18"
						/>
						<span>{{ resolved === 'dark' ? 'Tema claro' : 'Tema escuro' }}</span>
					</button>
				</aside>

				<main class="content">
					<RouterView />
				</main>
			</div>
		</v-main>
	</v-app>
</template>

<style scoped>
.layout {
	display: flex;
	align-items: stretch;
	min-height: 100vh;
}

.sidebar {
	position: sticky;
	top: 0;
	align-self: flex-start;
	height: 100vh;
	width: 250px;
	flex: none;
	background: var(--sidebar-bg);
	border-right: 1px solid var(--sidebar-border);
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 24px 16px;
}

.brand {
	padding: 4px 8px 20px;
	border-bottom: 1px solid var(--sidebar-divider);
	margin-bottom: 12px;
}

.menu {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.menu-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 0.7rem 0.85rem;
	border-radius: var(--radius-sm);
	font-family: var(--font-head);
	font-weight: 700;
	font-size: var(--fs-xs);
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: var(--sidebar-fg);
	text-decoration: none;
	transition:
		background 0.18s var(--ease),
		color 0.18s var(--ease);
}

.menu-item:hover {
	background: var(--sidebar-hover);
	color: var(--sidebar-fg-strong);
}

.menu-item.is-active {
	background: var(--sidebar-active-bg);
	color: var(--sidebar-active-fg);
}

.theme-toggle {
	margin-top: auto;
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 0.7rem 0.85rem;
	border: 1px solid var(--sidebar-border);
	border-radius: var(--radius-sm);
	background: transparent;
	color: var(--sidebar-fg);
	font-family: var(--font-head);
	font-weight: 700;
	font-size: var(--fs-xs);
	letter-spacing: 0.08em;
	text-transform: uppercase;
	cursor: pointer;
	transition:
		background 0.18s var(--ease),
		color 0.18s var(--ease),
		border-color 0.18s var(--ease);
}

.theme-toggle:hover {
	background: var(--sidebar-hover);
	color: var(--sidebar-fg-strong);
	border-color: var(--sidebar-fg);
}

.content {
	flex: 1;
	min-width: 0;
	max-width: var(--content-max);
	margin: 0 auto;
	padding: 40px 32px 64px;
	width: 100%;
}

@media (max-width: 860px) {
	.layout {
		flex-direction: column;
	}
	.sidebar {
		position: static;
		height: auto;
		width: 100%;
		flex-direction: row;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		overflow-x: auto;
	}
	.brand {
		padding: 0 8px 0 0;
		border-bottom: 0;
		border-right: 1px solid var(--sidebar-divider);
		margin-bottom: 0;
		flex: none;
	}
	.menu {
		flex-direction: row;
		gap: 4px;
	}
	.menu-item span {
		display: none;
	}
	.menu-item {
		padding: 0.6rem 0.75rem;
	}
	.theme-toggle {
		margin-top: 0;
		margin-left: 8px;
		flex: none;
		padding: 0.55rem 0.7rem;
		position: sticky;
		right: 8px;
		z-index: 1;
		background: var(--sidebar-bg);
	}
	.theme-toggle span {
		display: none;
	}
	.content {
		padding: 28px 16px 48px;
	}
}
</style>
