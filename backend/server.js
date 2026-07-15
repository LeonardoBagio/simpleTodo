require('dotenv').config()

const express = require('express')
const app = express();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


const todoRoutes = require('./routes/todoRoutes');
app.use('/todo', todoRoutes);


app.listen(process.env.NODE_PORT, () => {
	console.log(`Server is running on port ${process.env.NODE_PORT}`);
})