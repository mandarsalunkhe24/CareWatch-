const express = require('express');
const router = express.Router();

const { listVitals, createVital } = require('../controllers/vitalReadings');

router.route('/').get(listVitals).post(createVital);

module.exports = router;
