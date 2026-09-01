const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const backupService = require('../services/backupService');
const backupScheduler = require('../services/backupScheduler');

function db() {
	return mongoose.connection.db;
}

exports.status = async (req, res, next) => {
	try {
		res.status(StatusCodes.OK).json({
			configured: backupService.isConfigured(),
			backups: backupService.list(),
		});
	} catch (error) {
		next(error);
	}
};

exports.configure = async (req, res, next) => {
	try {
		const created = backupService.configure();
		res.status(created ? StatusCodes.CREATED : StatusCodes.OK).json({
			configured: true,
			created,
			backups: backupService.list(),
		});
	} catch (error) {
		next(error);
	}
};

exports.create = async (req, res, next) => {
	try {
		const backup = await backupService.create(db());
		res.status(StatusCodes.CREATED).json(backup);
	} catch (error) {
		next(error);
	}
};

exports.restore = async (req, res, next) => {
	try {
		const name = req.body && req.body.name;
		if (!name) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: 'Informe o backup a restaurar' });
		}

		const result = await backupService.restore(db(), name);
		res.status(StatusCodes.OK).json(result);
	} catch (error) {
		next(error);
	}
};

exports.remoteStatus = async (req, res, next) => {
	try {
		res.status(StatusCodes.OK).json(backupService.remoteStatus());
	} catch (error) {
		next(error);
	}
};

exports.configureRemote = async (req, res, next) => {
	try {
		const token = req.body && req.body.token;
		if (!token) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: 'Informe o token do rclone' });
		}

		res.status(StatusCodes.OK).json(backupService.configureRemote(token));
	} catch (error) {
		next(error);
	}
};

exports.push = async (req, res, next) => {
	try {
		const result = await backupService.push();
		res.status(StatusCodes.OK).json(result);
	} catch (error) {
		next(error);
	}
};

exports.scheduleStatus = async (req, res, next) => {
	try {
		res.status(StatusCodes.OK).json(backupScheduler.status());
	} catch (error) {
		next(error);
	}
};

exports.scheduleUpdate = async (req, res, next) => {
	try {
		res.status(StatusCodes.OK).json(backupScheduler.setConfig(req.body || {}));
	} catch (error) {
		next(error);
	}
};
