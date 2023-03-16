const express = require('express');
const walletsController = require('./wallet.controller');
const router = express.Router();

// Wallet Database Endpoints
router.get('/', walletsController.GET_WALLETS);
router.post('/', walletsController.POST_WALLET);
router.put('/', walletsController.PUT_WALLETS);

// Wallet Alchemy Endpoints
router.get('/:wallet/tokens', walletsController.GET_WALLET_TOKENS);
router.get('/:wallet/transactions', walletsController.GET_WALLET_TRANSACTIONS);

module.exports = router;