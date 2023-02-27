const express = require('express');
const tokenPairs = require('./token/token.pairs');
const walletTokens = require('./wallet/wallet.tokens');
const walletTransactions = require('./wallet/wallet.transactions');
const router = express.Router();

router.get('/wallet/tokens/:wallet', walletTokens.GET_WALLET_TOKENS);
router.get('/wallet/transactions/:wallet', walletTransactions.GET_WALLET_TRANSACTIONS)
router.get('/token/pairs/:symbol', tokenPairs.GET_TOKEN_PAIRS);

module.exports = router;