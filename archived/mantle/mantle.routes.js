const express = require('express');
const router = express.Router();
const mantle_controller = require('./mantle.controller')

router.get('/', mantle_controller.GET_MANTLE);

module.exports = router;