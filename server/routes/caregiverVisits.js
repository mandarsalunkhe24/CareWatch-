const express = require('express');
const router = express.Router();

const { listVisits, createVisit } = require('../controllers/caregiverVisits');

router.route('/').get(listVisits).post(createVisit);

module.exports = router;
