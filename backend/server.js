const dotenv = require('dotenv');
const connectDB = require('./config/dataBase');
const seedCatalog = require('./config/seed');
const app = require('./app');

dotenv.config();
connectDB().then(seedCatalog);

const PORT = process.env.NODE_PORT || process.env.PORT || 3000;
const server = app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

const shutdown = (signal) => {
	console.log(`\n${signal} recebido, encerrando o servidor...`);
	server.close(() => {
		console.log('Servidor HTTP encerrado.');
		process.exit(0);
	});
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
