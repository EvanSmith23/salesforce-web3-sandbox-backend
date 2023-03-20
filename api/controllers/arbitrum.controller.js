require('dotenv').config();

const { Network } = require('alchemy-sdk');

const Alchemy = require('../services/alchemy.services');

module.exports = {
  GET_ARBITRUM_ACCOUNT_TOKENS: async (req,res) => {
    const { account } = req.params;

    const settings = {
      apiKey: process.env.ALCHEMY_API_KEY,
      network: Network.ARB_MAINNET,
    };

    let nativeTokens = await Alchemy.getAccountNativeBalance(settings, account);

    let accountTokens = await Alchemy.getAccountERC20Balance(settings, account, nativeTokens);

    let nonZeroTokens = await Alchemy.filterAccountTokens(accountTokens);

    let finalAcctTkns = await Alchemy.formatAccountTokens(nonZeroTokens);

    return finalAcctTkns;
  },
  GET_ARBITRUM_ACCOUNT_TRANSACTIONS: async (req,res) => {
    const { account } = req.params;

    const settings = {
      apiKey: process.env.ALCHEMY_API_KEY,
      network: Network.ARB_MAINNET,
    };

    let transactions = await Alchemy.getAccountTransactions(settings, account, 50);
    
    let formattedTxs = await Alchemy.formatAccountTransactions(settings, account, transactions, "arbitrum");
  
    return res.json({
      'transactions': formattedTxs,
    });
  },
};
