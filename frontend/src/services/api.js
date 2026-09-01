import axios from 'axios';

function resolveBase() {
	const explicit = import.meta.env.VITE_API_URL;
	if (explicit) return explicit;

	const port = import.meta.env.VITE_API_PORT || '3000';
	const { protocol, hostname } = window.location;
	return `${protocol}//${hostname}:${port}`;
}

const base = resolveBase().replace(/\/$/, '');

const http = axios.create({
	baseURL: `${base}/api`,
	headers: { 'Content-Type': 'application/json' },
});

export default {
	todos: {
		getAll(params = {}) {
			return http.get('/todos', { params }).then((r) => r.data);
		},
		counts() {
			return http.get('/todos/counts').then((r) => r.data);
		},
		create(payload) {
			return http.post('/todos', payload).then((r) => r.data);
		},
		update(id, patch) {
			return http.patch(`/todos/${id}`, patch).then((r) => r.data);
		},
		remove(id) {
			return http.delete(`/todos/${id}`).then((r) => r.data);
		},
	},
	statuses: {
		getAll() {
			return http.get('/statuses').then((r) => r.data);
		},
		create(payload) {
			return http.post('/statuses', payload).then((r) => r.data);
		},
		update(id, patch) {
			return http.patch(`/statuses/${id}`, patch).then((r) => r.data);
		},
		remove(id) {
			return http.delete(`/statuses/${id}`).then((r) => r.data);
		},
	},
	categories: {
		getAll() {
			return http.get('/categories').then((r) => r.data);
		},
		create(payload) {
			return http.post('/categories', payload).then((r) => r.data);
		},
		update(id, patch) {
			return http.patch(`/categories/${id}`, patch).then((r) => r.data);
		},
		remove(id) {
			return http.delete(`/categories/${id}`).then((r) => r.data);
		},
	},
	backups: {
		status() {
			return http.get('/backups').then((r) => r.data);
		},
		configure() {
			return http.post('/backups/configure').then((r) => r.data);
		},
		create() {
			return http.post('/backups').then((r) => r.data);
		},
		restore(name) {
			return http.post('/backups/restore', { name }).then((r) => r.data);
		},
		remoteStatus() {
			return http.get('/backups/remote').then((r) => r.data);
		},
		configureRemote(token) {
			return http.post('/backups/remote/configure', { token }).then((r) => r.data);
		},
		push() {
			return http.post('/backups/remote/push').then((r) => r.data);
		},
		schedule() {
			return http.get('/backups/schedule').then((r) => r.data);
		},
		saveSchedule(config) {
			return http.put('/backups/schedule', config).then((r) => r.data);
		},
	},
};
