require('dotenv').config();

const Axios = require('axios');

module.exports = {
  getDexScreenerPairs: async (symbol) => {
    try {
      let dexscreener = await Axios.get('https://api.dexscreener.com/latest/dex/search/?q=' + symbol);
      
      let pairs = dexscreener.data.pairs; //.filter((pair) => pair.dexId == 'uniswap' || pair.dexId == 'sushiswap' || pair.dexId == 'pancakeswap')
      
      return pairs.sort((a,b) => a.volume.h24 > b.volume.h24)
    } catch (err) {
      console.error(err);

      return [];
    }
  },
  formatDexScreenerPairs: async (tokenPairs) => {
    tokenPairs.forEach((pair) => {
      pair.name = pair.baseToken.symbol + '_' + pair.quoteToken.symbol + '_' + pair.chainId + '_' + pair.dexId;
      pair.baseTokenName = pair.baseToken.name;
      pair.baseTokenAddress = pair.baseToken.address;
      pair.baseTokenSymbol = pair.baseToken.symbol;
      pair.quoteTokenName = pair.quoteToken.name;
      pair.quoteTokenAddress = pair.quoteToken.address;
      pair.quoteTokenSymbol = pair.quoteToken.symbol;
      pair.volume24hr = pair.volume.h24;
      pair.volume6hr = pair.volume.h6;
      pair.volume1hr = pair.volume.h1;

      /**
       * NOT USING THESE
       * unregistered dexs break the TradingView Chart
       */
      if (pair.dexId === "uniswap") {
          if (pair.chainId === "ethereum") {
            pair.symbol = "uniswap3eth:" + pair.baseToken.symbol + pair.quoteToken.symbol;
          } else if (pair.chainId === "arbitrum") {
            pair.symbol = "uniswap3arbitrum:" + pair.baseToken.symbol + pair.quoteToken.symbol;
          } else if (pair.chainId === "optimism") {
              // What is optimism's shorthand?
              pair.symbol = "uniswap3op:" + pair.baseToken.symbol + pair.quoteToken.symbol;
          }
      } else if (pair.dexId === "sushiswap") {
          pair.symbol = "sushiswap:" + pair.baseToken.symbol + pair.quoteToken.symbol;
      } else {
        pair.symbol = pair.dexId + ":" + pair.baseToken.symbol + pair.quoteToken.symbol;
      }

      pair.symbolLabel = pair.symbol?.toUpperCase();
    })

    return tokenPairs;
  }
};
