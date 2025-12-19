const express = require('express');
const router = express.Router();

const { listSosAlerts, createSosAlert, updateSosAlert } = require('../controllers/sosAlerts');

router.route('/').get(listSosAlerts).post(createSosAlert);
router.route('/:id').patch(updateSosAlert);

module.exports = router;
