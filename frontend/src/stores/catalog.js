import { reactive, computed } from 'vue';
import api from '../services/api';
import { GROUP_ORDER, GROUP_LABEL } from '../utils/states';

const state = reactive({
	statuses: [],
	categories: [],
	loaded: false,
	loading: false,
});

const statusById = computed(() =>
	Object.fromEntries(state.statuses.map((s) => [s._id, s])),
);
const categoryById = computed(() =>
	Object.fromEntries(state.categories.map((c) => [c._id, c])),
);

const statusesByGroup = computed(() =>
	GROUP_ORDER.map((group) => ({
		group,
		label: GROUP_LABEL[group],
		items: state.statuses.filter((s) => s.group === group),
	})).filter((g) => g.items.length > 0),
);

async function fetchAll(force = false) {
	if (state.loaded && !force) return;
	state.loading = true;
	try {
		const [statuses, categories] = await Promise.all([
			api.statuses.getAll(),
			api.categories.getAll(),
		]);
		state.statuses = statuses;
		state.categories = categories;
		state.loaded = true;
	} finally {
		state.loading = false;
	}
}

function replace(list, item) {
	const i = list.findIndex((x) => x._id === item._id);
	if (i === -1) list.push(item);
	else list.splice(i, 1, item);
}

async function saveStatus(payload, id) {
	const saved = id
		? await api.statuses.update(id, payload)
		: await api.statuses.create(payload);
	replace(state.statuses, saved);
	state.statuses.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
	return saved;
}

async function removeStatus(id) {
	await api.statuses.remove(id);
	state.statuses = state.statuses.filter((s) => s._id !== id);
}

async function saveCategory(payload, id) {
	const saved = id
		? await api.categories.update(id, payload)
		: await api.categories.create(payload);
	replace(state.categories, saved);
	state.categories.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
	return saved;
}

async function removeCategory(id) {
	await api.categories.remove(id);
	state.categories = state.categories.filter((c) => c._id !== id);
}

export function useCatalog() {
	return {
		state,
		statusById,
		categoryById,
		statusesByGroup,
		fetchAll,
		saveStatus,
		removeStatus,
		saveCategory,
		removeCategory,
	};
}
