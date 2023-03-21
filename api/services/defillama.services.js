require('dotenv').config();

const Axios = require('axios');

module.exports ={
  getDefiLlamaChains: async () => {
    try {
      let chains = await Axios.get(`https://api.llama.fi/chains`);

      return chains;
    } catch (err) {
      console.error(err);
    }
  },
  getDefiLlamaTokenPrices: async (chain, tokenAddress) => {
    try {
      let token = await Axios.get(`https://coins.llama.fi/prices/current/${chain}:${tokenAddress}`);

      return token;
    } catch (err) {
      console.error(err);
    }
  },
  /**
   * DexId
   * How can I can the chart from TradingView?
   * How can I get the dex url?
   * Example (Arbitrum Exchange): 0x1C6E968f2E6c9DEC61DB874E28589fd5CE3E1f2c
   */
  getDefiLlamaHistoricalPrice: async (timestamp, chain, tokenAddress) => {
    try {
      let historicalPrice = await Axios.get(`https://coins.llama.fi/prices/historical/${timestamp}/${chain}:${tokenAddress}`);

      return historicalPrice;
    } catch (err) {
      console.error(err);
    }
  }
};
