const express = require('express');
const walletsController = require('./wallet.controller');
const router = express.Router();

// Wallet Database Endpoints
router.get('/wallet', walletsController.GET_WALLETS);
router.post('/wallet', walletsController.POST_WALLET);
router.put('/wallet', walletsController.PUT_WALLETS);

// Wallet Alchemy Endpoints
router.get('/wallet/:wallet/tokens', walletsController.GET_WALLET_TOKENS);
router.get('/wallet/:wallet/transactions', walletsController.GET_WALLET_TRANSACTIONS)

module.exports = router;