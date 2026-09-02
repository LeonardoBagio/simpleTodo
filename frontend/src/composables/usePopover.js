import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue';

export function usePopover(width) {
	const open = ref(false);
	const triggerEl = ref(null);
	const panelStyle = ref({});

	function place() {
		const el = triggerEl.value;
		if (!el) return;
		const r = el.getBoundingClientRect();
		let left = r.left;
		if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
		if (left < 8) left = 8;
		const below = window.innerHeight - r.bottom;
		const openUp = below < 280 && r.top > below;
		panelStyle.value = openUp
			? { left: `${left}px`, bottom: `${window.innerHeight - r.top + 6}px`, width: `${width}px` }
			: { left: `${left}px`, top: `${r.bottom + 6}px`, width: `${width}px` };
	}

	function toggle() {
		open.value = !open.value;
		if (open.value) nextTick(place);
	}

	function close() {
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

	return { open, triggerEl, panelStyle, toggle, close };
}
