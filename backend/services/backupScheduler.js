const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const backupService = require('./backupService');
const { BackupError } = backupService;

const FREQUENCIES = ['hourly', 'daily', 'weekly'];
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const DEFAULTS = {
	enabled: false,
	frequency: 'daily',
	time: '02:00',
	dayOfWeek: 0,
	push: true,
	lastRun: null,
	lastStatus: null,
	lastError: null,
	lastBackup: null,
	nextRun: null,
};

let running = false;
let timer = null;

function dir() {
	return process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
}

function statePath() {
	return path.join(dir(), 'schedule.json');
}

function load() {
	try {
		return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(statePath(), 'utf8')) };
	} catch (error) {
		return { ...DEFAULTS };
	}
}

function save(state) {
	fs.mkdirSync(dir(), { recursive: true });
	fs.writeFileSync(statePath(), JSON.stringify(state, null, 2));
}

function computeNext(state, from) {
	const [h, m] = state.time.split(':').map(Number);
	const next = new Date(from);
	next.setSeconds(0, 0);

	if (state.frequency === 'hourly') {
		next.setMinutes(m);
		if (next <= from) next.setHours(next.getHours() + 1);
		return next;
	}

	next.setHours(h, m, 0, 0);

	if (state.frequency === 'weekly') {
		const delta = (Number(state.dayOfWeek) - next.getDay() + 7) % 7;
		next.setDate(next.getDate() + delta);
		if (next <= from) next.setDate(next.getDate() + 7);
		return next;
	}

	if (next <= from) next.setDate(next.getDate() + 1);
	return next;
}

function status() {
	return load();
}

function setConfig(patch) {
	const state = load();

	if ('enabled' in patch) state.enabled = !!patch.enabled;
	if ('push' in patch) state.push = !!patch.push;

	if ('frequency' in patch) {
		if (!FREQUENCIES.includes(patch.frequency)) throw new BackupError('INVALID_SCHEDULE');
		state.frequency = patch.frequency;
	}
	if ('time' in patch) {
		if (!TIME_RE.test(patch.time)) throw new BackupError('INVALID_SCHEDULE');
		state.time = patch.time;
	}
	if ('dayOfWeek' in patch) {
		const day = Number(patch.dayOfWeek);
		if (!Number.isInteger(day) || day < 0 || day > 6) throw new BackupError('INVALID_SCHEDULE');
		state.dayOfWeek = day;
	}

	state.nextRun = state.enabled ? computeNext(state, new Date()).toISOString() : null;
	save(state);
	return state;
}

async function runNow() {
	if (running) return;
	running = true;
	const state = load();
	try {
		if (mongoose.connection.readyState !== 1) throw new Error('Banco de dados indisponível');
		const backup = await backupService.create(mongoose.connection.db);
		state.lastBackup = backup.name;
		state.lastPushed = false;
		if (state.push && backupService.remoteConfigured()) {
			await backupService.push();
			state.lastPushed = true;
		}
		state.lastStatus = 'ok';
		state.lastError = null;
	} catch (error) {
		state.lastStatus = 'error';
		state.lastError = error.message || String(error);
	} finally {
		state.lastRun = new Date().toISOString();
		state.nextRun = state.enabled ? computeNext(state, new Date()).toISOString() : null;
		save(state);
		running = false;
	}
}

function tick() {
	const state = load();
	if (!state.enabled || !state.nextRun) return;
	if (new Date() >= new Date(state.nextRun)) runNow();
}

function start() {
	if (timer) return;
	const state = load();
	if (state.enabled && !state.nextRun) {
		state.nextRun = computeNext(state, new Date()).toISOString();
		save(state);
	}
	timer = setInterval(tick, 30000);
	if (timer.unref) timer.unref();
}

module.exports = { status, setConfig, runNow, start };
