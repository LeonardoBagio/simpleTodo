export function relativeTime(value) {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';

	const now = new Date();
	const diffMs = now - date;
	const min = Math.round(diffMs / 60000);

	if (min < 1) return 'agora';
	if (min < 60) return `há ${min} min`;

	const hours = Math.round(min / 60);
	if (hours < 24 && date.getDate() === now.getDate()) {
		return `há ${hours} h`;
	}

	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth()) {
		return 'ontem';
	}

	return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

export function todayLabel() {
	return new Date().toLocaleDateString('pt-BR', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
	});
}
