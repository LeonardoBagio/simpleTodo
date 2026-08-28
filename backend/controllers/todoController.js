const Todo = require('../models/TodoModel');
const { StatusCodes } = require('http-status-codes');

const POPULATE = [
	{ path: 'status', select: 'label color group sortOrder' },
	{ path: 'category', select: 'label color sortOrder' },
];

function readRef(value) {
	if (value === null || value === '') return null;
	return value;
}

exports.getAll = async (req, res, next) => {
	try {
		const all = await Todo.find().populate(POPULATE).sort({ createdAt: -1 });
		res.status(StatusCodes.OK).json(all);
	} catch (error) {
		next(error);
	}
};

exports.create = async (req, res, next) => {
	try {
		const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
		if (!title) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: 'O título da tarefa é obrigatório' });
		}

		const created = await Todo.create({
			title,
			status: readRef(req.body.status),
			category: readRef(req.body.category),
		});

		const todo = await created.populate(POPULATE);
		res.status(StatusCodes.CREATED).json(todo);
	} catch (error) {
		next(error);
	}
};

exports.update = async (req, res, next) => {
	try {
		const updates = {};

		if (typeof req.body.title === 'string') {
			const title = req.body.title.trim();
			if (!title) {
				return res
					.status(StatusCodes.BAD_REQUEST)
					.json({ message: 'O título não pode ser vazio' });
			}
			updates.title = title;
		}

		if (req.body.status !== undefined) {
			updates.status = readRef(req.body.status);
		}

		if (req.body.category !== undefined) {
			updates.category = readRef(req.body.category);
		}

		if (Object.keys(updates).length === 0) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: 'Nenhum campo válido para atualizar' });
		}

		const todo = await Todo.findByIdAndUpdate(req.params.id, updates, {
			new: true,
			runValidators: true,
		}).populate(POPULATE);

		if (!todo) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Tarefa não encontrada' });
		}

		res.status(StatusCodes.OK).json(todo);
	} catch (error) {
		next(error);
	}
};

exports.remove = async (req, res, next) => {
	try {
		const todo = await Todo.findByIdAndDelete(req.params.id);

		if (!todo) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Tarefa não encontrada' });
		}

		res.status(StatusCodes.OK).json({ message: 'Tarefa excluída', id: todo._id });
	} catch (error) {
		next(error);
	}
};
