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
    /**
     * ADD STAKE
     * IF ONLY 1 SELL THEN Stake, Bridge, Off-Ramp
     * If 2 Then Transfer
     * If Only 1 Buy THEN Unstake Unbridge, On Ramp
     * CHECK LIQUIDITY FOR VALIDATION
     * AND CHECK LIQUIDITY FOR WHEN TO ENTER THE MARKET
     * SO THERES NO SLIPPAGE
     * LOOK UP SLIPPAGE 
     */
    const alchemy = new Alchemy(networkSettings);
    
    let tmp = {}
    for (let i = 0; i < transactions.length; i++) {
      /* GET PRICE
      if (transactions[i].rawContract.address) {
        let timestamp = new Date(transactions[i].metadata.blockTimestamp).getTime() / 1000;
        let historicalPrice = await DefiLlama.getDefiLlamaHistoricalPrice(timestamp,chain, transactions[i].rawContract.address);
        transactions[i].price = historicalPrice.data.coins[`${chain}:${transactions[i].rawContract.address}`]?.price || '--';
      }*/

      let txHash = transactions[i].hash;

      if (tmp[txHash]) {
        tmp[txHash].action = "SWAP";
        tmp[txHash].assetTwo = transactions[i].asset;
        tmp[txHash].summary = tmp[txHash].summary + " for " + (transactions[i].value?.toFixed(5) || 0.00) + " " + transactions[i].asset;
        tmp[txHash].contractAddressTwo = transactions[i].rawContract.address;
      } else {
        tmp[txHash] = transactions[i]
        tmp[txHash].chain = chain;
        tmp[txHash].value = transactions[i].value?.toFixed(5) || 0.00;
        tmp[txHash].summary = transactions[i].value + " " + transactions[i].asset;
        tmp[txHash].blockTimestamp = Moment(transactions[i].metadata.blockTimestamp).tz("America/Chicago").format('lll');
        tmp[txHash].contractAddress = transactions[i].rawContract.address;

        if (transactions[i].to.toUpperCase() === accountAddress.toUpperCase()) {
          tmp[txHash].action = "RECEIVE";
        } else if (transactions[i].from.toUpperCase() === accountAddress.toUpperCase()) {
          tmp[txHash].action = "TRANSFER";
        }
        
        /**
         * GET TRANSACTION GAS USED
         */
        let tx = await alchemy.core.getTransactionReceipt(txHash);
        tmp[txHash].gas = (tx.gasUsed.toNumber() * 0.0000000001).toFixed(7);
      }
    } 

    return Object.values(tmp);
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