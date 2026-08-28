const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/dataBase');
const seedCatalog = require('./config/seed');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

dotenv.config();
connectDB().then(seedCatalog);

const app = express();
app.use(cors());
app.use(express.json());

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const todoRoutes = require('./routes/todoRoutes');
const statusRoutes = require('./routes/statusRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/todos', todoRoutes);
app.use('/api/statuses', statusRoutes);
app.use('/api/categories', categoryRoutes);

app.use(notFound);
app.use(errorHandler);

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
