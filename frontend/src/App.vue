<script setup>
import { onMounted } from 'vue';
import Wordmark from './components/Wordmark.vue';
import { useCatalog } from './stores/catalog';

const nav = [
	{ to: '/painel', label: 'Painel', icon: 'mdi-view-dashboard-outline' },
	{ to: '/dashboard', label: 'Dashboard', icon: 'mdi-chart-box-outline' },
	{ to: '/categorias', label: 'Categoria', icon: 'mdi-tag-multiple-outline' },
	{ to: '/status', label: 'Status', icon: 'mdi-format-list-bulleted-type' },
];

const catalog = useCatalog();
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
						>
							<v-icon :icon="item.icon" size="18" />
							<span>{{ item.label }}</span>
						</RouterLink>
					</nav>
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
	background: rgba(0, 0, 0, 0.94);
	border-right: 1px solid rgba(255, 255, 255, 0.1);
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 24px 16px;
}

.brand {
	padding: 4px 8px 20px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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
	color: rgba(255, 255, 255, 0.6);
	text-decoration: none;
	transition: background 0.18s var(--ease), color 0.18s var(--ease);
}

.menu-item:hover {
	background: rgba(255, 255, 255, 0.06);
	color: rgba(255, 255, 255, 0.92);
}

.menu-item.is-active {
	background: var(--color-white);
	color: var(--color-ink);
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
		border-right: 1px solid rgba(255, 255, 255, 0.08);
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
	.content {
		padding: 28px 16px 48px;
	}
}
</style>
