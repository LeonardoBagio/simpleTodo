const express = require('express');
const router = express.Router();

const todoController = require('../controllers/todoController');

router.get('/', todoController.getAll)

router.post('/todo', todoController.create)

module.exports = router;