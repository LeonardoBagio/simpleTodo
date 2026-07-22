const Todo = require('../models/TodoModel');
const {StatusCodes, getReasonPhrase } = require('http-status-codes');

exports.getAll = async (req, res, next) => {
	try {
		const all = await Todo.find().sort({ createdAt: -1 });

		res.status(StatusCodes.OK).json(all);
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error retrieving all', error: error.message });
	}
}

exports.create = async (req, res, next) => {
	try {
		const todo = await Todo.create({ title: req.body.title, completed: req.body.completed })

		res.status(StatusCodes.OK).json(todo)
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error retrieving all', error: error.message });
	}
}