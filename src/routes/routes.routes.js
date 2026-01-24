const express = require('express');
const routesController = require('../controllers/routes.controller');

const router = express.Router();

router.get('/status', routesController.getStatus);
router.post('/journey', routesController.findJourney);

module.exports = router;
