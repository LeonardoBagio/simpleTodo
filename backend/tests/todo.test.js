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

async function makeDoneStatus() {
	return Status.create({ label: 'Concluído', color: '#448361', group: 'concluidos' });
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

	it('oculta tarefas concluídas por padrão', async () => {
		const done = await makeDoneStatus();
		await Todo.create({ title: 'Ativa' });
		await Todo.create({ title: 'Finalizada', status: done._id });

		const res = await request(app).get('/api/todos');
		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(1);
		expect(res.body[0].title).toBe('Ativa');
	});

	it('inclui as concluídas com includeDone=true', async () => {
		const done = await makeDoneStatus();
		await Todo.create({ title: 'Ativa' });
		await Todo.create({ title: 'Finalizada', status: done._id });

		const res = await request(app).get('/api/todos').query({ includeDone: 'true' });
		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(2);
	});

	it('busca por título e traz concluídas mesmo sem includeDone', async () => {
		const done = await makeDoneStatus();
		await Todo.create({ title: 'Estudar Docker', status: done._id });
		await Todo.create({ title: 'Outra coisa' });

		const res = await request(app).get('/api/todos').query({ search: 'docker' });
		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(1);
		expect(res.body[0].title).toBe('Estudar Docker');
	});

	it('busca também pelo número da issue', async () => {
		await Todo.create({ title: 'Sem match no título', issue: '207' });
		await Todo.create({ title: 'Outra', issue: '999' });

		const res = await request(app).get('/api/todos').query({ search: '207' });
		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(1);
		expect(res.body[0].issue).toBe('207');
	});
});

describe('GET /api/todos/counts', () => {
	it('retorna contagens de ativas, concluídas e total', async () => {
		const done = await makeDoneStatus();
		await Todo.create({ title: 'Ativa 1' });
		await Todo.create({ title: 'Ativa 2' });
		await Todo.create({ title: 'Finalizada', status: done._id });

		const res = await request(app).get('/api/todos/counts');
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ active: 2, done: 1, total: 3 });
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

	it('cria com o número da issue e faz trim', async () => {
		const res = await request(app)
			.post('/api/todos')
			.send({ title: 'Com issue', issue: '  207  ' });
		expect(res.status).toBe(201);
		expect(res.body.issue).toBe('207');
	});

	it('usa issue vazia quando não informada', async () => {
		const res = await request(app).post('/api/todos').send({ title: 'Sem issue' });
		expect(res.status).toBe(201);
		expect(res.body.issue).toBe('');
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

	it('atualiza o número da issue', async () => {
		const todo = await Todo.create({ title: 'Original' });
		const res = await request(app)
			.patch(`/api/todos/${todo._id}`)
			.send({ issue: '693' });
		expect(res.status).toBe(200);
		expect(res.body.issue).toBe('693');
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
