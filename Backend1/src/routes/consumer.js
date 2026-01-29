const express = require('express');
const router = express.Router();
const consumerController = require('../controllers/consumerController');

router.get('/verify/:batchNumber', consumerController.verifyBatch);

module.exports = router;
