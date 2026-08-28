<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useCatalog } from '../stores/catalog';

const props = defineProps({
	modelValue: { type: [String, null], default: null },
	allLabel: { type: String, default: 'Sem categoria' },
});
const emit = defineEmits(['update:modelValue']);

const catalog = useCatalog();
const open = ref(false);
const triggerEl = ref(null);
const panelStyle = ref({});
const PANEL_W = 224;

const current = computed(() =>
	props.modelValue != null ? catalog.categoryById.value[props.modelValue] : undefined,
);

function place() {
	const el = triggerEl.value;
	if (!el) return;
	const r = el.getBoundingClientRect();
	let left = r.left;
	if (left + PANEL_W > window.innerWidth - 8) left = window.innerWidth - PANEL_W - 8;
	if (left < 8) left = 8;
	const below = window.innerHeight - r.bottom;
	const openUp = below < 280 && r.top > below;
	panelStyle.value = openUp
		? { left: `${left}px`, bottom: `${window.innerHeight - r.top + 6}px`, width: `${PANEL_W}px` }
		: { left: `${left}px`, top: `${r.bottom + 6}px`, width: `${PANEL_W}px` };
}

function toggle() {
	open.value = !open.value;
	if (open.value) nextTick(place);
}

function pick(id) {
	emit('update:modelValue', id);
	open.value = false;
}

function onReflow() {
	if (open.value) place();
}

onMounted(() => {
	window.addEventListener('scroll', onReflow, true);
	window.addEventListener('resize', onReflow);
});
onBeforeUnmount(() => {
	window.removeEventListener('scroll', onReflow, true);
	window.removeEventListener('resize', onReflow);
});
</script>

<template>
	<div class="select-root">
		<button
			ref="triggerEl"
			type="button"
			class="trigger"
			:class="{ colored: current }"
			:style="current ? { background: current.color, borderColor: 'transparent', color: '#fff' } : {}"
			:aria-expanded="open"
			aria-haspopup="listbox"
			@click="toggle"
		>
			<span>{{ current ? current.label : allLabel }}</span>
			<v-icon icon="mdi-chevron-down" size="14" :style="current ? { color: 'rgba(255,255,255,0.75)' } : {}" class="chev" />
		</button>

		<Teleport to="body">
			<div v-if="open" class="scrim" @click="open = false" />
			<Transition name="menu">
				<div v-if="open" class="panel card" :style="panelStyle" role="listbox">
					<button type="button" class="opt none" @click="pick(null)">
						<span class="none-dot" />
						{{ allLabel }}
					</button>
					<button
						v-for="c in catalog.state.categories"
						:key="c._id"
						type="button"
						class="opt"
						:class="{ active: modelValue === c._id }"
						@click="pick(c._id)"
					>
						<span class="cat-dot" :style="{ background: c.color }" />
						{{ c.label }}
					</button>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<style scoped>
.select-root {
	position: relative;
	display: inline-block;
}

.trigger {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	background: var(--surface);
	border: 1px solid var(--border-strong);
	border-radius: var(--radius-pill);
	padding: 0.4rem 0.75rem;
	font-family: var(--font-head);
	font-weight: 700;
	font-size: var(--fs-xs);
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: var(--text-muted-on-light);
	cursor: pointer;
	transition: border-color 0.2s var(--ease);
}

.trigger:not(.colored):hover {
	border-color: rgba(0, 0, 0, 0.28);
}

.cat-dot,
.none-dot {
	width: 10px;
	height: 10px;
	border-radius: 999px;
	flex: none;
}

.none-dot {
	border: 1px solid rgba(0, 0, 0, 0.2);
}
</style>
