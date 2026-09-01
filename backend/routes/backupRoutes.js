const express = require('express');
const router = express.Router();

const backupController = require('../controllers/backupController');

router.get('/', backupController.status);
router.post('/', backupController.create);
router.post('/configure', backupController.configure);
router.post('/restore', backupController.restore);
router.get('/remote', backupController.remoteStatus);
router.post('/remote/configure', backupController.configureRemote);
router.post('/remote/push', backupController.push);
router.get('/schedule', backupController.scheduleStatus);
router.put('/schedule', backupController.scheduleUpdate);

module.exports = router;
