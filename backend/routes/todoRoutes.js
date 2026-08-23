const express = require('express');
const router = express.Router();

const todoController = require('../controllers/todoController');

router.get('/', todoController.getAll);
router.post('/', todoController.create);
router.patch('/:id', todoController.update);
router.delete('/:id', todoController.remove);

module.exports = router;
