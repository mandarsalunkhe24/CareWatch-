const express = require('express');
const router = express.Router();

const { getMonthlySummary } = require('../controllers/summary');

router.get('/monthly', getMonthlySummary);

module.exports = router;
