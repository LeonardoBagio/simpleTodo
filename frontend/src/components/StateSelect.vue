<script setup>
import { computed } from 'vue';
import { useCatalog } from '../stores/catalog';
import { usePopover } from '../composables/usePopover';

const props = defineProps({
	modelValue: { type: [String, null], default: null },
	allLabel: { type: String, default: '' },
	placeholder: { type: String, default: 'Selecionar status' },
});
const emit = defineEmits(['update:modelValue']);

const catalog = useCatalog();
const { open, triggerEl, panelStyle, toggle, close } = usePopover(240);

const current = computed(() =>
	props.modelValue != null ? catalog.statusById.value[props.modelValue] : undefined,
);

function pick(id) {
	emit('update:modelValue', id);
	close();
}
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
			<span :class="{ muted: !current }">{{ current ? current.label : (allLabel || placeholder) }}</span>
			<v-icon icon="mdi-chevron-down" size="14" class="chev" :style="current ? { color: 'rgba(255,255,255,0.75)' } : {}" />
		</button>

		<Teleport to="body">
			<div v-if="open" class="scrim" @click="open = false" />
			<Transition name="menu">
				<div v-if="open" class="panel card" :style="panelStyle" role="listbox">
					<button
						v-if="allLabel"
						type="button"
						class="opt"
						:class="{ active: modelValue == null }"
						@click="pick(null)"
					>
						<span class="none-dot" />
						{{ allLabel }}
					</button>
					<div v-for="grp in catalog.statusesByGroup.value" :key="grp.group" class="grp">
						<p class="grp-label eyebrow">{{ grp.label }}</p>
						<button
							v-for="s in grp.items"
							:key="s._id"
							type="button"
							class="opt"
							:class="{ active: modelValue === s._id }"
							@click="pick(s._id)"
						>
							<span class="state-dot" :style="{ background: s.color }" />
							{{ s.label }}
						</button>
					</div>
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
	color: var(--color-ink);
	cursor: pointer;
	transition: border-color 0.2s var(--ease);
}

.trigger:not(.colored):hover {
	border-color: rgba(var(--wash-rgb), 0.3);
}

.trigger .muted {
	color: var(--text-muted-on-light);
}

.state-dot {
	width: 10px;
	height: 10px;
	border-radius: 999px;
	flex: none;
}

.chev {
	color: var(--color-mist);
}
</style>
