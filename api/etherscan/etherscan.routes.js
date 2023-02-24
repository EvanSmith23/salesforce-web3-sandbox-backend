const express = require('express');
const etherscanController = require('./etherscan.controller');
const router = express.Router();

router.get('/contract/:contract', etherscanController.GET_ETHERSCAN);
router.get('/wallet/:wallet', etherscanController.GET_ETH_ACCOUNT_INFO);
router.get('/transactions/:wallet', etherscanController.GET_WALLET_TRANSACTIONS)
module.exports = router;