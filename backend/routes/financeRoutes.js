const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const verifyToken = require('../middleware/verifyToken');

router.post('/add', verifyToken, financeController.addTransaction);
router.get('/transactions', verifyToken, financeController.getTransactions);

module.exports = router;