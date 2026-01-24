const express = require('express');
const stopsController = require('../controllers/stops.controller');

const router = express.Router();

router.get('/', stopsController.getStops);
router.get('/nearby', stopsController.getNearbyStops);
router.get('/:id', stopsController.getStopById);

module.exports = router;
