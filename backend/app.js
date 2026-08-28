const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

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

module.exports = app;
