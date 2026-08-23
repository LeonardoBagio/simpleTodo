import axios from 'axios';

const base = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

const http = axios.create({
	baseURL: `${base}/api/todos`,
	headers: { 'Content-Type': 'application/json' },
});

export default {
	getAll() {
		return http.get('/').then((r) => r.data);
	},
	create(title) {
		return http.post('/', { title }).then((r) => r.data);
	},
	update(id, patch) {
		return http.patch(`/${id}`, patch).then((r) => r.data);
	},
	remove(id) {
		return http.delete(`/${id}`).then((r) => r.data);
	},
};
