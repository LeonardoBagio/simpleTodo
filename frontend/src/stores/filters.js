import { reactive, watch } from 'vue';

const STORAGE_KEY = 'simpleTodo:filters';
const DEFAULTS = { category: null, period: 'all' };

function load() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { ...DEFAULTS };
		return { ...DEFAULTS, ...JSON.parse(raw) };
	} catch (e) {
		return { ...DEFAULTS };
	}
}

const state = reactive(load());

watch(
	state,
	(value) => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
		} catch (e) {
			return;
		}
	},
	{ deep: true },
);

export function useFilters() {
	return { state };
}
