<script setup>
defineProps({
	tone: { type: String, default: 'light' },
	compact: { type: Boolean, default: false },
});
</script>

<template>
	<span class="wordmark" :class="[tone, { compact }]">
		<span class="mark" aria-hidden="true">
			<svg :width="compact ? 18 : 22" :height="compact ? 18 : 22" viewBox="0 0 24 24" fill="none">
				<path d="M4 16a8 8 0 0116 0" :stroke="tone === 'dark' ? '#1a1a1a' : '#ffffff'" stroke-opacity="0.5" stroke-width="1.6" stroke-linecap="round" />
				<path d="M12 16l5-4.2" :stroke="tone === 'dark' ? '#1a1a1a' : '#ffffff'" stroke-width="1.8" stroke-linecap="round" />
				<circle cx="12" cy="16" r="1.7" :fill="tone === 'dark' ? '#1a1a1a' : '#ffffff'" />
			</svg>
		</span>
		<span class="text">
			<span class="name">Simple<span class="mid">·</span>Todo</span>
			<span v-if="!compact" class="eyebrow sub">Painel de controle de tarefas</span>
		</span>
	</span>
</template>

<style scoped>
.wordmark {
	display: inline-flex;
	align-items: center;
	gap: 10px;
	user-select: none;
}

.mark {
	display: grid;
	place-items: center;
	width: 40px;
	height: 40px;
	border-radius: var(--radius-sm);
}

.wordmark.compact .mark {
	width: 32px;
	height: 32px;
}

.wordmark.dark .mark {
	background: var(--color-white);
}

.wordmark.light .mark {
	background: var(--color-ink);
}

.text {
	line-height: 1;
}

.name {
	display: block;
	font-family: var(--font-head);
	font-weight: 900;
	letter-spacing: -0.02em;
	font-size: 1.125rem;
}

.wordmark.compact .name {
	font-size: 15px;
}

.wordmark.dark .name {
	color: var(--color-white);
}

.wordmark.light .name {
	color: var(--color-ink);
}

.name .mid {
	color: var(--color-mist);
}

.wordmark.dark .name .mid {
	color: rgba(255, 255, 255, 0.5);
}

.sub {
	display: block;
	margin-top: 3px;
	font-size: 9px;
}

.wordmark.dark .sub {
	color: rgba(255, 255, 255, 0.55);
}

.wordmark.light .sub {
	color: var(--text-muted-on-light);
}

@media (max-width: 860px) {
	.sub {
		display: none;
	}
}
</style>
