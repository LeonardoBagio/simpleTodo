<script setup>
import Wordmark from './components/Wordmark.vue';
import TodoView from './views/TodoView.vue';
</script>

<template>
	<v-app>
		<v-main>
			<header class="topbar">
				<div class="topbar-inner">
					<Wordmark tone="dark" />
					<nav class="nav">
						<span class="nav-pill">
							<v-icon icon="mdi-gauge" size="15" />
							<span>Painel</span>
						</span>
					</nav>
				</div>
			</header>

			<main class="content">
				<TodoView />
			</main>
		</v-main>
	</v-app>
</template>

<style scoped>
.topbar {
	position: sticky;
	top: 0;
	z-index: 30;
	background: rgba(0, 0, 0, 0.9);
	backdrop-filter: blur(8px);
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.topbar-inner {
	max-width: var(--content-max);
	margin: 0 auto;
	height: var(--header-h);
	padding: 0 24px;
	display: flex;
	align-items: center;
	gap: 16px;
}

.nav {
	margin-left: auto;
	display: flex;
	align-items: center;
	gap: 8px;
}

.nav-pill {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	background: var(--color-white);
	color: var(--color-ink);
	border-radius: var(--radius-pill);
	padding: 0.5rem 0.9rem;
	font-family: var(--font-head);
	font-weight: 700;
	font-size: var(--fs-xs);
	letter-spacing: 0.08em;
	text-transform: uppercase;
}

.content {
	max-width: var(--content-max);
	margin: 0 auto;
	padding: 48px 24px;
}

@media (max-width: 640px) {
	.content {
		padding: 32px 16px;
	}
	.topbar-inner {
		padding: 0 16px;
	}
}
</style>
