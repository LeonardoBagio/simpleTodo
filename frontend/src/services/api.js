import axios from 'axios';

const base = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

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
};
