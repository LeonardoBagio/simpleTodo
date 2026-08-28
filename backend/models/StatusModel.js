const mongoose = require('mongoose');

const STATUS_GROUPS = ['a_fazer', 'em_andamento', 'concluidos'];

const statusSchema = new mongoose.Schema(
	{
		label: {
			type: String,
			required: [true, 'Informe o nome do status'],
			trim: true,
		},
		color: {
			type: String,
			required: [true, 'Informe a cor do status'],
			trim: true,
			default: '#9b9a97',
		},
		group: {
			type: String,
			required: [true, 'Informe o grupo (A fazer, Em andamento ou Concluído)'],
			enum: {
				values: STATUS_GROUPS,
				message: 'Grupo inválido: use a_fazer, em_andamento ou concluidos',
			},
		},
		sortOrder: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true },
);

const StatusModel = mongoose.model('Status', statusSchema);
StatusModel.GROUPS = STATUS_GROUPS;

module.exports = StatusModel;
