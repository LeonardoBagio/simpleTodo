<script setup>
defineProps({
	tone: { type: String, default: 'light' },
	compact: { type: Boolean, default: false },
});
</script>

<template>
	<span class="wordmark" :class="[tone, { compact }]">
		<span class="mark" aria-hidden="true">
			<svg :width="compact ? 18 : 22" :height="compact ? 18 : 22" viewBox="0 0 48 48" fill="none">
				<rect x="16" y="9" width="21" height="25" rx="3.5" fill="#ffffff" />
				<rect x="20" y="15" width="13" height="2.4" rx="1.2" fill="#a89bff" />
				<rect x="20" y="20" width="13" height="2.4" rx="1.2" fill="#a89bff" />
				<rect x="20" y="25" width="9" height="2.4" rx="1.2" fill="#a89bff" />
				<path d="M11 27h10a3.5 3.5 0 013.5 3.5V36A3.5 3.5 0 0121 39.5h-6L11 43v-3.5A3.5 3.5 0 017.5 36v-5.5A3.5 3.5 0 0111 27z" fill="#ffffff" fill-opacity="0.7" stroke="#ffffff" stroke-width="2.2" />
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

.wordmark.dark .mark,
.wordmark.light .mark {
	background: var(--accent-gradient);
	box-shadow: var(--accent-glow);
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
