const express = require('express');
const routesController = require('../controllers/routes.controller');

const router = express.Router();

router.get('/status', routesController.getStatus);
router.get('/', routesController.getRoutes);
router.get('/:id', routesController.getRouteById);
router.get('/:id/stops', routesController.getRouteStops);

module.exports = router;
