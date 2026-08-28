const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });
const m2s = require('mongoose-to-swagger');
const Todo = require('./models/TodoModel');
const Status = require('./models/StatusModel');
const Category = require('./models/CategoryModel');

const swaggerTodoSchema = m2s(Todo);
const swaggerStatusSchema = m2s(Status);
const swaggerCategorySchema = m2s(Category);

const doc = {
  info: {
    title: 'ToDo API Node.js',
    version: '1.0.0'
  },
  host: 'localhost:3000',
  components: {
    schemas: {
      Todo: swaggerTodoSchema,
      Status: swaggerStatusSchema,
      Category: swaggerCategorySchema
    }
  }
};

const outputFile = './swagger-output.json';

const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Documentação Swagger gerada com sucesso!');
  process.exit(0);
}).catch((err) => {
  console.error('Erro ao gerar o Swagger:', err);
  process.exit(1);
});