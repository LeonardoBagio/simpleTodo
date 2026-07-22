const express = require('express')
const cors = require('cors');
const dotenv = require('dotenv')
const connectDB = require('./config/dataBase');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


const todoRoutes = require('./routes/todoRoutes');
app.use('/todo', todoRoutes);


app.listen(process.env.NODE_PORT, () => {
	console.log(`Server is running on port ${process.env.NODE_PORT}`);
})