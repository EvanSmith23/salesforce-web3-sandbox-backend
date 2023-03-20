const Axios = require('axios');
const Moment = require('moment');

const { Alchemy } = require('alchemy-sdk');
const DefiLlama = require('./defillama.services');

module.exports = {
  getAccountTransactions: async (networkSettings, accountAddress, numberOfTransactions) => {
    const alchemy = new Alchemy(networkSettings);

    let assetTransfersFrom = await alchemy.core.getAssetTransfers({
        fromAddress: accountAddress,
        category: ['external', "erc20", "erc721", "erc1155", "specialnft"],
        withMetadata: true,
        excludeZeroValue: true,
        order: 'desc'
    });

    let assetTransfersTo = await alchemy.core.getAssetTransfers({
        toAddress: accountAddress,
        category: ['external', "erc20", "erc721", "erc1155", "specialnft"],
        withMetadata: true,
        excludeZeroValue: true,
        order: 'desc'
    });

    let txBoth = assetTransfersFrom.transfers.concat(assetTransfersTo.transfers)
    
    return txBoth.sort((a,b) => {
        if (new Date(a.metadata.blockTimestamp).getTime() < new Date(b.metadata.blockTimestamp).getTime()) {
            return 1;
        } else if (new Date(a.metadata.blockTimestamp).getTime() > new Date(b.metadata.blockTimestamp).getTime()) {
            return -1;
        } else {
            return 0;
        }
    }).slice(0, numberOfTransactions);
  },
  formatAccountTransactions: async (networkSettings, accountAddress, transactions, chain) => {
    const alchemy = new Alchemy(networkSettings);
    
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].to.toUpperCase() === accountAddress.toUpperCase()) {
            transactions[i].action = "BUY";
        } else if (transactions[i].from.toUpperCase() === accountAddress.toUpperCase()) {
            transactions[i].action = "SELL";
        }
        
        transactions[i].chain = chain;
        transactions[i].value = transactions[i].value?.toFixed(5) || 0.00;
        transactions[i].blockTimestamp = Moment(transactions[i].metadata.blockTimestamp).tz("America/Chicago").format('lll');
        transactions[i].contractAddress = transactions[i].rawContract.address;
        if (transactions[i].rawContract.address) {
          let prices = await DefiLlama.getDefiLlamaTokenPrices(chain, transactions[i].rawContract.address);
          let keyVal = chain + ':' + transactions[i].rawContract.address;
          transactions[i].price = prices.data.coins[keyVal]?.price.toFixed(3) || 'not found';
        }

        // let prices = await DefiLlama.getDefiLlamaTokenPrices(transactions[i].contractAddress);
        // console.log(prices.data);
    } 

    return transactions;
  },
  getAccountNativeBalance: async (networkSettings, accountAddress) => {
    const alchemy = new Alchemy(networkSettings);

    let nativeToken = await alchemy.core.getBalance(accountAddress);

    let walletTokens = [];
    walletTokens.push({ 
        label: 'ETH', 
        symbol: 'ETH',
        name: 'Ether',
        contractAddress: 'native', 
        walletBalance: (parseInt(nativeToken) / Math.pow(10, 18)),
        decimals: 18
    });

    return walletTokens;
  }, 
  getAccountERC20Balance: async (networkSettings, accountAddress, accountTokens) => {
    const alchemy = new Alchemy(networkSettings);

    let erc20Tokens = await alchemy.core.getTokenBalances(accountAddress);

    for (let i = 0; i < erc20Tokens.tokenBalances.length; i++){
        let data = await alchemy.core.getTokenMetadata(erc20Tokens.tokenBalances[i].contractAddress);
        
        accountTokens.push({
            label: data.symbol,
            contractAddress: erc20Tokens.tokenBalances[i].contractAddress,
            walletBalance: parseInt(erc20Tokens.tokenBalances[i].tokenBalance) / Math.pow(10, data.decimals),
            ...data
        })
    }

    return accountTokens;
  },
  filterAccountTokens: async (accountTokens) => {
    return accountTokens.filter((token) => token.walletBalance > 0).sort((a, b) => {
      if (a.label < b.label) return -1;
      else if (a.label > b.label) return 1;
      else return 0;
    })
  },
  formatAccountTokens: async (accountTokens) => {
    for (let i=0; i < accountTokens.length; i++) {
      let dexscreener = await Axios.get('https://api.dexscreener.com/latest/dex/search/?q=' + accountTokens[i].symbol + '/USDT');
      
      if (dexscreener.data.pairs.length > 0) {
          // accountTokens[i].stats = dexscreener.data.pairs[0];
          accountTokens[i].priceUSD = dexscreener.data.pairs[0].priceUsd;
          accountTokens[i].priceChange1hr = dexscreener.data.pairs[0].priceChange.h1 + '%';
          accountTokens[i].priceChange24hr = dexscreener.data.pairs[0].priceChange.h24 + '%';
          accountTokens[i].url = dexscreener.data.pairs[0].url;
      }
    }

    return accountTokens;
  }
};