const Status = require('../models/StatusModel');
const Todo = require('../models/TodoModel');
const { StatusCodes } = require('http-status-codes');

function buildPayload(body) {
	const payload = {};
	if (typeof body.label === 'string') payload.label = body.label.trim();
	if (typeof body.color === 'string') payload.color = body.color.trim();
	if (typeof body.group === 'string') payload.group = body.group.trim();
	if (body.sortOrder !== undefined) payload.sortOrder = Number(body.sortOrder) || 0;
	return payload;
}

exports.getAll = async (req, res, next) => {
	try {
		const all = await Status.find().sort({ sortOrder: 1, createdAt: 1 });
		res.status(StatusCodes.OK).json(all);
	} catch (error) {
		next(error);
	}
};

exports.create = async (req, res, next) => {
	try {
		const payload = buildPayload(req.body);
		if (!payload.label) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: 'O nome do status é obrigatório' });
		}
		if (!payload.group) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: 'O grupo do status é obrigatório' });
		}

		const status = await Status.create(payload);
		res.status(StatusCodes.CREATED).json(status);
	} catch (error) {
		next(error);
	}
};

exports.update = async (req, res, next) => {
	try {
		const payload = buildPayload(req.body);
		if (Object.keys(payload).length === 0) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: 'Nenhum campo válido para atualizar' });
		}

		const status = await Status.findByIdAndUpdate(req.params.id, payload, {
			new: true,
			runValidators: true,
		});

		if (!status) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Status não encontrado' });
		}

		res.status(StatusCodes.OK).json(status);
	} catch (error) {
		next(error);
	}
};

exports.remove = async (req, res, next) => {
	try {
		const status = await Status.findByIdAndDelete(req.params.id);
		if (!status) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Status não encontrado' });
		}

		await Todo.updateMany({ status: status._id }, { status: null });
		res.status(StatusCodes.OK).json({ message: 'Status excluído', id: status._id });
	} catch (error) {
		next(error);
	}
};
