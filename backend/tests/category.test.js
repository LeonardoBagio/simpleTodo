const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const db = require('./helpers/db');
const Category = require('../models/CategoryModel');
const Todo = require('../models/TodoModel');

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.disconnect());

const valid = { label: 'feature', color: '#337ea9' };

describe('GET /api/categories', () => {
	it('retorna as categorias ordenadas por sortOrder', async () => {
		await Category.create({ ...valid, label: 'B', sortOrder: 2 });
		await Category.create({ ...valid, label: 'A', sortOrder: 1 });
		const res = await request(app).get('/api/categories');
		expect(res.status).toBe(200);
		expect(res.body.map((c) => c.label)).toEqual(['A', 'B']);
	});
});

describe('POST /api/categories', () => {
	it('cria uma categoria e retorna 201', async () => {
		const res = await request(app).post('/api/categories').send(valid);
		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({ label: 'feature' });
	});

	it('usa a cor padrão quando não informada', async () => {
		const res = await request(app).post('/api/categories').send({ label: 'sem cor' });
		expect(res.status).toBe(201);
		expect(res.body.color).toBe('#9b9a97');
	});

	it('rejeita label ausente com 400', async () => {
		const res = await request(app).post('/api/categories').send({});
		expect(res.status).toBe(400);
		expect(res.body.message).toMatch(/nome da categoria/i);
	});
});

describe('PATCH /api/categories/:id', () => {
	it('atualiza uma categoria', async () => {
		const category = await Category.create(valid);
		const res = await request(app)
			.patch(`/api/categories/${category._id}`)
			.send({ label: 'Renomeada' });
		expect(res.status).toBe(200);
		expect(res.body.label).toBe('Renomeada');
	});

	it('rejeita corpo sem campos válidos com 400', async () => {
		const category = await Category.create(valid);
		const res = await request(app).patch(`/api/categories/${category._id}`).send({});
		expect(res.status).toBe(400);
	});

	it('retorna 404 quando a categoria não existe', async () => {
		const id = new mongoose.Types.ObjectId();
		const res = await request(app).patch(`/api/categories/${id}`).send({ label: 'X' });
		expect(res.status).toBe(404);
	});
});

describe('DELETE /api/categories/:id', () => {
	it('exclui a categoria e desvincula as tarefas', async () => {
		const category = await Category.create(valid);
		const todo = await Todo.create({ title: 'Ligada', category: category._id });
		const res = await request(app).delete(`/api/categories/${category._id}`);
		expect(res.status).toBe(200);
		expect(res.body.id).toBe(String(category._id));

		const reloaded = await Todo.findById(todo._id);
		expect(reloaded.category).toBeNull();
	});

	it('retorna 404 quando a categoria não existe', async () => {
		const id = new mongoose.Types.ObjectId();
		const res = await request(app).delete(`/api/categories/${id}`);
		expect(res.status).toBe(404);
	});
});
