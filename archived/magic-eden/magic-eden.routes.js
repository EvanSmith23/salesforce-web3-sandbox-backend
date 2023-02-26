const express = require('express');
const router = express.Router();
const magic_eden_controller = require('./magic-eden.controller')

router.get('/', magic_eden_controller.GET_MAGIC_EDEN_COLLECTIONS);
router.get('/collection/:collection', magic_eden_controller.GET_MAGIC_EDEN_COLLECTION);
router.get('/token/:token', magic_eden_controller.GET_MAGIC_EDEN_TOKEN);
router.get('/wallet/:wallet', magic_eden_controller.GET_MAGIC_EDEN_WALLET);

module.exports = router;