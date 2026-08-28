const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const db = require('./helpers/db');
const Status = require('../models/StatusModel');
const Todo = require('../models/TodoModel');

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.disconnect());

const valid = { label: 'Em andamento', color: '#337ea9', group: 'em_andamento' };

describe('GET /api/statuses', () => {
	it('retorna os status ordenados por sortOrder', async () => {
		await Status.create({ ...valid, label: 'B', sortOrder: 2 });
		await Status.create({ ...valid, label: 'A', sortOrder: 1 });
		const res = await request(app).get('/api/statuses');
		expect(res.status).toBe(200);
		expect(res.body.map((s) => s.label)).toEqual(['A', 'B']);
	});
});

describe('POST /api/statuses', () => {
	it('cria um status e retorna 201', async () => {
		const res = await request(app).post('/api/statuses').send(valid);
		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({ label: 'Em andamento', group: 'em_andamento' });
	});

	it('rejeita label ausente com 400', async () => {
		const res = await request(app).post('/api/statuses').send({ group: 'a_fazer' });
		expect(res.status).toBe(400);
		expect(res.body.message).toMatch(/nome do status/i);
	});

	it('rejeita group ausente com 400', async () => {
		const res = await request(app).post('/api/statuses').send({ label: 'X' });
		expect(res.status).toBe(400);
		expect(res.body.message).toMatch(/grupo/i);
	});

	it('rejeita group inválido com 422 (ValidationError)', async () => {
		const res = await request(app)
			.post('/api/statuses')
			.send({ label: 'X', group: 'inexistente' });
		expect(res.status).toBe(422);
	});
});

describe('PATCH /api/statuses/:id', () => {
	it('atualiza um status', async () => {
		const status = await Status.create(valid);
		const res = await request(app)
			.patch(`/api/statuses/${status._id}`)
			.send({ label: 'Renomeado' });
		expect(res.status).toBe(200);
		expect(res.body.label).toBe('Renomeado');
	});

	it('rejeita corpo sem campos válidos com 400', async () => {
		const status = await Status.create(valid);
		const res = await request(app).patch(`/api/statuses/${status._id}`).send({});
		expect(res.status).toBe(400);
	});

	it('retorna 404 quando o status não existe', async () => {
		const id = new mongoose.Types.ObjectId();
		const res = await request(app).patch(`/api/statuses/${id}`).send({ label: 'X' });
		expect(res.status).toBe(404);
	});
});

describe('DELETE /api/statuses/:id', () => {
	it('exclui o status e desvincula as tarefas', async () => {
		const status = await Status.create(valid);
		const todo = await Todo.create({ title: 'Ligada', status: status._id });
		const res = await request(app).delete(`/api/statuses/${status._id}`);
		expect(res.status).toBe(200);
		expect(res.body.id).toBe(String(status._id));

		const reloaded = await Todo.findById(todo._id);
		expect(reloaded.status).toBeNull();
	});

	it('retorna 404 quando o status não existe', async () => {
		const id = new mongoose.Types.ObjectId();
		const res = await request(app).delete(`/api/statuses/${id}`);
		expect(res.status).toBe(404);
	});
});
