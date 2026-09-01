const fs = require('fs');
const os = require('os');
const path = require('path');

const backupDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stbackup-'));
process.env.BACKUP_DIR = backupDir;

const request = require('supertest');
const app = require('../app');
const db = require('./helpers/db');
const Category = require('../models/CategoryModel');
const Todo = require('../models/TodoModel');

beforeAll(() => db.connect());
afterEach(() => db.clear());
afterAll(async () => {
	await db.disconnect();
	fs.rmSync(backupDir, { recursive: true, force: true });
});

describe('GET /api/backups', () => {
	it('inicia como não configurado e sem backups', async () => {
		const res = await request(app).get('/api/backups');
		expect(res.status).toBe(200);
		expect(res.body.configured).toBe(false);
		expect(res.body.backups).toEqual([]);
	});
});

describe('POST /api/backups (sem configurar)', () => {
	it('recusa com 409 quando ainda não há chave', async () => {
		const res = await request(app).post('/api/backups');
		expect(res.status).toBe(409);
		expect(res.body.message).toMatch(/não configurado/i);
	});
});

describe('POST /api/backups/configure', () => {
	it('gera a chave e passa a reportar configurado', async () => {
		const res = await request(app).post('/api/backups/configure');
		expect(res.status).toBe(201);
		expect(res.body.configured).toBe(true);
		expect(res.body.created).toBe(true);

		const again = await request(app).post('/api/backups/configure');
		expect(again.status).toBe(200);
		expect(again.body.created).toBe(false);
	});
});

describe('ciclo de backup e restauração', () => {
	it('gera um backup e o lista', async () => {
		await Category.create({ label: 'feature', color: '#337ea9' });
		await Todo.create({ title: 'Tarefa de teste' });

		const res = await request(app).post('/api/backups');
		expect(res.status).toBe(201);
		expect(res.body.name).toMatch(/^simpletodo-\d{8}-\d{6}\.stbackup$/);

		const listing = await request(app).get('/api/backups');
		expect(listing.body.backups.length).toBeGreaterThanOrEqual(1);
		expect(listing.body.backups[0].name).toBe(res.body.name);
	});

	it('restaura os dados após limpar as coleções', async () => {
		await Category.create({ label: 'bug', color: '#e03e3e' });
		await Todo.create({ title: 'Antes do backup' });

		const created = await request(app).post('/api/backups');
		const name = created.body.name;

		await Todo.deleteMany({});
		await Category.deleteMany({});
		expect(await Todo.countDocuments()).toBe(0);

		const res = await request(app)
			.post('/api/backups/restore')
			.send({ name });
		expect(res.status).toBe(200);
		expect(res.body.restored).toBeGreaterThanOrEqual(2);

		expect(await Todo.countDocuments()).toBe(1);
		expect(await Category.countDocuments()).toBe(1);
		const todo = await Todo.findOne();
		expect(todo.title).toBe('Antes do backup');
	});
});

describe('POST /api/backups/restore (erros)', () => {
	it('rejeita nome ausente com 400', async () => {
		const res = await request(app).post('/api/backups/restore').send({});
		expect(res.status).toBe(400);
	});

	it('rejeita nome com formato inválido com 400', async () => {
		const res = await request(app)
			.post('/api/backups/restore')
			.send({ name: '../etc/passwd' });
		expect(res.status).toBe(400);
	});

	it('retorna 404 para um backup inexistente', async () => {
		const res = await request(app)
			.post('/api/backups/restore')
			.send({ name: 'simpletodo-20000101-000000.stbackup' });
		expect(res.status).toBe(404);
	});
});
