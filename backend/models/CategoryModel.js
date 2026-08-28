const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
	{
		label: {
			type: String,
			required: [true, 'Informe o nome da categoria'],
			trim: true,
		},
		color: {
			type: String,
			required: [true, 'Informe a cor da categoria'],
			trim: true,
			default: '#9b9a97',
		},
		sortOrder: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Category', categorySchema);
