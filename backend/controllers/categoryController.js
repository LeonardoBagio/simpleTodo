const Category = require('../models/CategoryModel');
const Todo = require('../models/TodoModel');
const { StatusCodes } = require('http-status-codes');

function buildPayload(body) {
	const payload = {};
	if (typeof body.label === 'string') payload.label = body.label.trim();
	if (typeof body.color === 'string') payload.color = body.color.trim();
	if (body.sortOrder !== undefined) payload.sortOrder = Number(body.sortOrder) || 0;
	return payload;
}

exports.getAll = async (req, res, next) => {
	try {
		const all = await Category.find().sort({ sortOrder: 1, createdAt: 1 });
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
				.json({ message: 'O nome da categoria é obrigatório' });
		}

		const category = await Category.create(payload);
		res.status(StatusCodes.CREATED).json(category);
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

		const category = await Category.findByIdAndUpdate(req.params.id, payload, {
			new: true,
			runValidators: true,
		});

		if (!category) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Categoria não encontrada' });
		}

		res.status(StatusCodes.OK).json(category);
	} catch (error) {
		next(error);
	}
};

exports.remove = async (req, res, next) => {
	try {
		const category = await Category.findByIdAndDelete(req.params.id);
		if (!category) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Categoria não encontrada' });
		}

		await Todo.updateMany({ category: category._id }, { category: null });
		res
			.status(StatusCodes.OK)
			.json({ message: 'Categoria excluída', id: category._id });
	} catch (error) {
		next(error);
	}
};
