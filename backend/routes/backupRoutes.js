const express = require('express');
const router = express.Router();

const backupController = require('../controllers/backupController');

router.get('/', backupController.status);
router.post('/', backupController.create);
router.post('/configure', backupController.configure);
router.post('/restore', backupController.restore);

module.exports = router;
