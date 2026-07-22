const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });
const m2s = require('mongoose-to-swagger');
const Todo = require('./models/TodoModel'); 

const swaggerTodoSchema = m2s(Todo);

const doc = {
  info: {
    title: 'ToDo API Node.js',
    version: '1.0.0'
  },
  host: 'localhost:3000',
  components: {
    schemas: {
      Todo: swaggerTodoSchema
    }
  }
};

const outputFile = './swagger-output.json';

const endpointsFiles = ['./server.js'];

// Executa a geração e força a finalização do processo apenas ao concluir
swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Documentação Swagger gerada com sucesso!');
  process.exit(0); // Fecha o script de forma segura
}).catch((err) => {
  console.error('Erro ao gerar o Swagger:', err);
  process.exit(1);
});