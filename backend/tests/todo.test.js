const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const db = require('./helpers/db');
const Todo = require('../models/TodoModel');
const Status = require('../models/StatusModel');
const Category = require('../models/CategoryModel');

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(() => db.disconnect());

async function makeStatus() {
	return Status.create({ label: 'Em andamento', color: '#337ea9', group: 'em_andamento' });
}

async function makeCategory() {
	return Category.create({ label: 'feature', color: '#337ea9' });
}

describe('GET /api/todos', () => {
	it('retorna lista vazia quando não há tarefas', async () => {
		const res = await request(app).get('/api/todos');
		expect(res.status).toBe(200);
		expect(res.body).toEqual([]);
	});

	it('retorna as tarefas mais recentes primeiro e popula status/categoria', async () => {
		const status = await makeStatus();
		const category = await makeCategory();
		await Todo.create({ title: 'Antiga' });
		await new Promise((r) => setTimeout(r, 5));
		await Todo.create({ title: 'Nova', status: status._id, category: category._id });

		const res = await request(app).get('/api/todos');
		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(2);
		expect(res.body[0].title).toBe('Nova');
		expect(res.body[0].status.label).toBe('Em andamento');
		expect(res.body[0].category.label).toBe('feature');
	});
});

describe('POST /api/todos', () => {
	it('cria uma tarefa e retorna 201', async () => {
		const res = await request(app).post('/api/todos').send({ title: 'Estudar Jest' });
		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({ title: 'Estudar Jest', status: null, category: null });
		expect(res.body._id).toBeDefined();
	});

	it('faz trim do título', async () => {
		const res = await request(app).post('/api/todos').send({ title: '  com espaços  ' });
		expect(res.status).toBe(201);
		expect(res.body.title).toBe('com espaços');
	});

	it('rejeita título ausente com 400', async () => {
		const res = await request(app).post('/api/todos').send({});
		expect(res.status).toBe(400);
		expect(res.body.message).toMatch(/obrigatório/i);
	});

	it('rejeita título só com espaços com 400', async () => {
		const res = await request(app).post('/api/todos').send({ title: '   ' });
		expect(res.status).toBe(400);
	});
});

describe('PATCH /api/todos/:id', () => {
	it('atualiza o título da tarefa', async () => {
		const todo = await Todo.create({ title: 'Original' });
		const res = await request(app)
			.patch(`/api/todos/${todo._id}`)
			.send({ title: 'Atualizado' });
		expect(res.status).toBe(200);
		expect(res.body.title).toBe('Atualizado');
	});

	it('permite limpar o status enviando null', async () => {
		const status = await makeStatus();
		const todo = await Todo.create({ title: 'Com status', status: status._id });
		const res = await request(app)
			.patch(`/api/todos/${todo._id}`)
			.send({ status: null });
		expect(res.status).toBe(200);
		expect(res.body.status).toBeNull();
	});

	it('rejeita título vazio com 400', async () => {
		const todo = await Todo.create({ title: 'Original' });
		const res = await request(app)
			.patch(`/api/todos/${todo._id}`)
			.send({ title: '   ' });
		expect(res.status).toBe(400);
	});

	it('rejeita corpo sem campos válidos com 400', async () => {
		const todo = await Todo.create({ title: 'Original' });
		const res = await request(app).patch(`/api/todos/${todo._id}`).send({ foo: 'bar' });
		expect(res.status).toBe(400);
		expect(res.body.message).toMatch(/nenhum campo/i);
	});

	it('retorna 404 quando a tarefa não existe', async () => {
		const id = new mongoose.Types.ObjectId();
		const res = await request(app).patch(`/api/todos/${id}`).send({ title: 'X' });
		expect(res.status).toBe(404);
	});

	it('retorna 400 para id inválido', async () => {
		const res = await request(app).patch('/api/todos/nao-e-um-id').send({ title: 'X' });
		expect(res.status).toBe(400);
		expect(res.body.message).toMatch(/inválido/i);
	});
});

describe('DELETE /api/todos/:id', () => {
	it('exclui a tarefa e retorna 200', async () => {
		const todo = await Todo.create({ title: 'Excluir' });
		const res = await request(app).delete(`/api/todos/${todo._id}`);
		expect(res.status).toBe(200);
		expect(res.body.id).toBe(String(todo._id));
		expect(await Todo.countDocuments()).toBe(0);
	});

	it('retorna 404 quando a tarefa não existe', async () => {
		const id = new mongoose.Types.ObjectId();
		const res = await request(app).delete(`/api/todos/${id}`);
		expect(res.status).toBe(404);
	});
});
