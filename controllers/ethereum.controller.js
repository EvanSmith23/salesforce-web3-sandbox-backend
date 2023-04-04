require('dotenv').config();

const { Network } = require('alchemy-sdk');

const Alchemy = require('../services/alchemy.services');
const CoinMarketCap = require('../services/coinmarketcap.services');
const DexScreener = require('../services/dexscreener.services');

module.exports = {
  GET_ETHEREUM_ACCOUNT_TOKENS: async (req,res) => {
    const { account } = req.params;

    const settings = {
      apiKey: process.env.ALCHEMY_API_KEY,
      network: Network.ETH_MAINNET,
    };

    let nativeTokens = await Alchemy.getAccountNativeBalance(settings, account);

    let accountTokens = await Alchemy.getAccountERC20Balance(settings, account, nativeTokens);

    let nonZeroTokens = await Alchemy.filterAccountTokens(accountTokens);

    let finalAcctTkns = await Alchemy.formatAccountTokens(nonZeroTokens);

    return res.json({
      'tokens': finalAcctTkns
    });
  },
  GET_ETHEREUM_ACCOUNT_TRANSACTIONS: async (req,res) => {
    const { account } = req.params;

    const settings = {
      apiKey: process.env.ALCHEMY_API_KEY,
      network: Network.ETH_MAINNET,
    };

    let transactions = await Alchemy.getAccountTransactions(settings, account, 50);
    
    let formattedTxs = await Alchemy.formatAccountTransactions(settings, account, transactions, "ethereum");
  
    return res.json({
      'transactions': formattedTxs,
    });
  },
  GET_ETHEREUM_TOKEN_PAIRS: async (req,res) => {
    console.log('GET_ETHEREUM_TOKEN_PAIRS');
    
    const { symbol } = req.params;

    let pairs = await DexScreener.getDexScreenerPairs(symbol);

    let formattedPairs = await DexScreener.formatDexScreenerPairs(pairs);

    res.json({
      'pairs': formattedPairs
    });
  },
  GET_ETHEREUM_TOKEN_CATEGORIES: async (req,res) => {
    let categories = await CoinMarketCap.getCoinMarketCapCategories();

    let formattedCategories = await CoinMarketCap.formatCoinMarketCapCategories(categories);

    return res.json({
      'categories': formattedCategories
    });
  },
};