const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const { EJSON } = require('bson');

const FILE_EXT = '.stbackup';
const NAME_RE = /^simpletodo-\d{8}-\d{6}\.stbackup$/;
const MAGIC = Buffer.from('STBK1\n');
const IV_LEN = 12;
const TAG_LEN = 16;

class BackupError extends Error {
	constructor(code) {
		const map = {
			NOT_CONFIGURED: [409, 'Backup não configurado. Gere a chave primeiro.'],
			INVALID_NAME: [400, 'Nome de backup inválido'],
			NOT_FOUND: [404, 'Backup não encontrado'],
			CORRUPT: [422, 'Arquivo de backup corrompido'],
			DECRYPT_FAILED: [422, 'Falha ao descriptografar (chave incorreta?)'],
		};
		const [status, message] = map[code] || [500, 'Erro de backup'];
		super(message);
		this.name = 'BackupError';
		this.code = code;
		this.status = status;
	}
}

function dir() {
	return process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
}

function keyPath() {
	return path.join(dir(), '.key');
}

function ensureDir() {
	fs.mkdirSync(dir(), { recursive: true });
}

function isConfigured() {
	return fs.existsSync(keyPath());
}

function configure() {
	ensureDir();
	if (isConfigured()) return false;
	const key = crypto.randomBytes(32);
	fs.writeFileSync(keyPath(), key.toString('base64') + '\n', { mode: 0o600 });
	return true;
}

function readKey() {
	const key = Buffer.from(fs.readFileSync(keyPath(), 'utf8').trim(), 'base64');
	if (key.length !== 32) throw new BackupError('CORRUPT');
	return key;
}

function timestamp(date = new Date()) {
	const pad = (n) => String(n).padStart(2, '0');
	const d = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
	const t = `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
	return `${d}-${t}`;
}

function entry(name) {
	const stat = fs.statSync(path.join(dir(), name));
	return { name, size: stat.size, createdAt: stat.mtime.toISOString() };
}

function list() {
	if (!fs.existsSync(dir())) return [];
	return fs
		.readdirSync(dir())
		.filter((name) => NAME_RE.test(name))
		.map(entry)
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function create(db) {
	if (!isConfigured()) throw new BackupError('NOT_CONFIGURED');
	ensureDir();

	const collections = {};
	for (const info of await db.listCollections().toArray()) {
		if (info.name.startsWith('system.')) continue;
		collections[info.name] = await db.collection(info.name).find({}).toArray();
	}

	const payload = {
		meta: { app: 'simpleTodo', version: 1, createdAt: new Date().toISOString() },
		collections,
	};

	const gzipped = zlib.gzipSync(Buffer.from(EJSON.stringify(payload), 'utf8'));
	const iv = crypto.randomBytes(IV_LEN);
	const cipher = crypto.createCipheriv('aes-256-gcm', readKey(), iv);
	const encrypted = Buffer.concat([cipher.update(gzipped), cipher.final()]);
	const output = Buffer.concat([MAGIC, iv, cipher.getAuthTag(), encrypted]);

	const name = `simpletodo-${timestamp()}${FILE_EXT}`;
	fs.writeFileSync(path.join(dir(), name), output);
	return entry(name);
}

async function restore(db, name) {
	if (!isConfigured()) throw new BackupError('NOT_CONFIGURED');
	if (!NAME_RE.test(name)) throw new BackupError('INVALID_NAME');

	const file = path.join(dir(), name);
	if (!fs.existsSync(file)) throw new BackupError('NOT_FOUND');

	const buffer = fs.readFileSync(file);
	if (!buffer.subarray(0, MAGIC.length).equals(MAGIC)) throw new BackupError('CORRUPT');

	const iv = buffer.subarray(MAGIC.length, MAGIC.length + IV_LEN);
	const tag = buffer.subarray(MAGIC.length + IV_LEN, MAGIC.length + IV_LEN + TAG_LEN);
	const encrypted = buffer.subarray(MAGIC.length + IV_LEN + TAG_LEN);

	let gzipped;
	try {
		const decipher = crypto.createDecipheriv('aes-256-gcm', readKey(), iv);
		decipher.setAuthTag(tag);
		gzipped = Buffer.concat([decipher.update(encrypted), decipher.final()]);
	} catch (error) {
		throw new BackupError('DECRYPT_FAILED');
	}

	const payload = EJSON.parse(zlib.gunzipSync(gzipped).toString('utf8'));
	const collections = payload.collections || {};

	let restored = 0;
	for (const [collectionName, docs] of Object.entries(collections)) {
		const collection = db.collection(collectionName);
		await collection.deleteMany({});
		if (docs.length) {
			await collection.insertMany(docs);
			restored += docs.length;
		}
	}

	return { restored, collections: Object.keys(collections).length };
}

module.exports = { BackupError, isConfigured, configure, list, create, restore };
