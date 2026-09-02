import { ref, computed } from 'vue';

const STORAGE_KEY = 'st-theme';

function readStored() {
	try {
		const v = localStorage.getItem(STORAGE_KEY);
		return v === 'dark' || v === 'light' ? v : null;
	} catch {
		return null;
	}
}

const media =
	typeof window !== 'undefined' && window.matchMedia
		? window.matchMedia('(prefers-color-scheme: dark)')
		: null;

const stored = ref(readStored());
const systemDark = ref(media ? media.matches : false);

if (media) {
	media.addEventListener('change', (e) => {
		systemDark.value = e.matches;
		if (!stored.value) apply();
	});
}

const resolved = computed(() =>
	stored.value ? stored.value : systemDark.value ? 'dark' : 'light',
);

function apply() {
	const root = document.documentElement;
	if (stored.value) root.setAttribute('data-theme', stored.value);
	else root.removeAttribute('data-theme');
}

function setTheme(mode) {
	stored.value = mode === 'dark' ? 'dark' : 'light';
	try {
		localStorage.setItem(STORAGE_KEY, stored.value);
	} catch {
		/* ignore */
	}
	apply();
}

function toggle() {
	setTheme(resolved.value === 'dark' ? 'light' : 'dark');
}

export function useTheme() {
	return { resolved, stored, setTheme, toggle, apply };
}
