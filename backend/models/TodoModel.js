const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Adicione um título para a tarefa'],
    trim: true,
		example: "Estudar Node.js"
  },
  completed: {
    type: Boolean,
    default: false,
		example: false
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Todo', todoSchema);