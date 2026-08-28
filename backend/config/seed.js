const Status = require('../models/StatusModel');
const Category = require('../models/CategoryModel');

const SEED_STATUSES = [
	{ label: 'Não iniciada', color: '#9b9a97', group: 'a_fazer', sortOrder: 1 },
	{ label: 'Stand by', color: '#cb7e3a', group: 'a_fazer', sortOrder: 2 },
	{ label: 'Aguardando retorno', color: '#dfab01', group: 'a_fazer', sortOrder: 3 },
	{ label: 'Code-review', color: '#e03e3e', group: 'em_andamento', sortOrder: 4 },
	{ label: 'Em andamento', color: '#337ea9', group: 'em_andamento', sortOrder: 5 },
	{ label: 'Pronto para homologar', color: '#c1558b', group: 'em_andamento', sortOrder: 6 },
	{ label: 'Homologação', color: '#9065b0', group: 'em_andamento', sortOrder: 7 },
	{ label: 'Concluído', color: '#448361', group: 'concluidos', sortOrder: 8 },
];

const SEED_CATEGORIES = [
	{ label: 'hotfix', color: '#b8496b', sortOrder: 1 },
	{ label: 'feature', color: '#337ea9', sortOrder: 2 },
	{ label: 'data conversion', color: '#c1912e', sortOrder: 3 },
	{ label: 'Release', color: '#448361', sortOrder: 4 },
	{ label: 'Task', color: '#9065b0', sortOrder: 5 },
	{ label: 'Epic', color: '#c1558b', sortOrder: 6 },
	{ label: 'sub issue', color: '#8a6ea6', sortOrder: 7 },
	{ label: 'Orientação', color: '#9b9a97', sortOrder: 8 },
];

const seedCatalog = async () => {
	try {
		if ((await Status.estimatedDocumentCount()) === 0) {
			await Status.insertMany(SEED_STATUSES);
			console.log(`Seed: ${SEED_STATUSES.length} status inseridos.`);
		}
		if ((await Category.estimatedDocumentCount()) === 0) {
			await Category.insertMany(SEED_CATEGORIES);
			console.log(`Seed: ${SEED_CATEGORIES.length} categorias inseridas.`);
		}
	} catch (error) {
		console.error(`Erro ao popular os cadastros: ${error.message}`);
	}
};

module.exports = seedCatalog;
