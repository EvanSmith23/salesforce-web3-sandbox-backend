const express = require('express');
const router = express.Router();
const solana_controller = require('./solana.controller')

router.get('/solana', solana_controller.GET_SOLANA_INFO);
router.get('/solana/public-key/:publicKey', solana_controller.GET_SOLANA_ACCOUNT);

module.exports = router;