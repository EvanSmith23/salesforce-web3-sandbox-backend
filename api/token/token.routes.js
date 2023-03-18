const express = require('express');
const tokenController = require('./token.controller');
const router = express.Router();

router.get('/pairs/:symbol', tokenController.GET_TOKEN_PAIRS);
router.get('/categories', tokenController.GET_TOKEN_CATEGORIES);

module.exports = router;