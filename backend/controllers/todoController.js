const Todo = require('../models/TodoModel');

exports.getAll = async (req, res, next) => {
	console.log('getAll')
	try {
		//const all = await Todo.find().sort({ createdAt: -1 });

		res.status(200).json({ message: 'Retrieved all successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Error retrieving all', error: error.message });
	}
}