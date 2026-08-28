const request = require('supertest');
const app = require('../app');
const db = require('./helpers/db');

beforeAll(() => db.connect());
afterAll(() => db.disconnect());

describe('rota inexistente', () => {
	it('retorna 404 com mensagem do middleware notFound', async () => {
		const res = await request(app).get('/api/nao-existe');
		expect(res.status).toBe(404);
		expect(res.body.message).toMatch(/rota não encontrada/i);
	});
});
