const express = require('express');
const appFunctions = require('./app/app.wallets');
const tokenPairs = require('./token/token.pairs');
const walletTokens = require('./wallet/wallet.tokens');
const walletTransactions = require('./wallet/wallet.transactions');
const router = express.Router();

// Wallet Database Endpoints
router.put('/app/wallet', appFunctions.PUT_APP_WALLET);
router.get('/app/wallets', appFunctions.GET_APP_WALLETS);
router.post('/app/wallets', appFunctions.POST_APP_WALLET);

// 3rd Party Data Endpoints
router.get('/wallet/:wallet/tokens', walletTokens.GET_WALLET_TOKENS);
router.get('/wallet/:wallet/transactions', walletTransactions.GET_WALLET_TRANSACTIONS)
router.get('/token/pairs/:symbol', tokenPairs.GET_TOKEN_PAIRS);

module.exports = router;