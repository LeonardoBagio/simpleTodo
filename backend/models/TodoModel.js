const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, 'Adicione um título para a tarefa'],
			trim: true,
			example: 'Estudar Node.js',
		},
		status: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Status',
			default: null,
		},
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Category',
			default: null,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Todo', todoSchema);
