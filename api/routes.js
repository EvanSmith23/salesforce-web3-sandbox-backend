const express = require('express');
const tokenPairs = require('./token.pairs');
const walletTokens = require('./wallet.tokens');
const walletTransactions = require('./wallet.transactions');
const router = express.Router();

router.get('/wallet/tokens/:wallet', walletTokens.GET_WALLET_TOKENS);
router.get('/wallet/transactions/:wallet', walletTransactions.GET_WALLET_TRANSACTIONS)
router.get('/token/pairs/:contract', tokenPairs.GET_TOKEN_PAIRS);

module.exports = router;