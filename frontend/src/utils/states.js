export const GROUP_ORDER = ['a_fazer', 'em_andamento', 'concluidos'];

export const GROUP_LABEL = {
	a_fazer: 'A fazer',
	em_andamento: 'Em andamento',
	concluidos: 'Concluídos',
};

export const GROUP_OPTIONS = GROUP_ORDER.map((value) => ({
	value,
	label: GROUP_LABEL[value],
}));

export function groupRank(group) {
	const i = GROUP_ORDER.indexOf(group);
	return i === -1 ? GROUP_ORDER.length : i;
}

export function fmtDate(iso) {
	if (!iso) return '';
	try {
		const d = new Date(iso);
		const p = (n) => String(n).padStart(2, '0');
		return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
	} catch {
		return iso;
	}
}
