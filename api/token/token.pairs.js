require('dotenv').config();
const Axios = require('axios');
const api = require('etherscan-api').init(process.env.ETHERSCAN_API_KEY, 'arbitrum', '3000');

module.exports = {
    GET_TOKEN_PAIRS: async (req, res) => {
        const { symbol } = req.params;
 
        try {
            //var supply = await api.stats.tokensupply(null, contract);
            let dexscreener = await Axios.get('https://api.dexscreener.com/latest/dex/search/?q=' + symbol);
            let pairs = dexscreener.data.pairs.filter((pair) => pair.dexId == 'uniswap' || pair.dexId == 'sushiswap' || pair.dexId == 'pancakeswap')
            let tokenPairs = pairs.sort((a,b) => a.volume.h24 > b.volume.h24)

            tokenPairs.forEach((pair) => {
                pair.name = pair.baseToken.symbol + '_' + pair.quoteToken.symbol + '_' + pair.chainId + '_' + pair.dexId;
                pair.baseTokenName = pair.baseToken.name;
                pair.baseTokenAddress = pair.baseToken.address;
                pair.quoteTokenName = pair.quoteToken.name;
                pair.quoteTokenAddress = pair.quoteToken.address;
                pair.volume24hr = pair.volume.h24;
                pair.volume6hr = pair.volume.h6;
                pair.volume1hr = pair.volume.h1;

                if (pair.dexId === "uniswap") {
                    if (pair.chainId === "ethereum") {
                      pair.symbol = "uniswap3eth:" + pair.baseToken.symbol + pair.quoteToken.symbol;
                    } else if (pair.chainId === "arbitrum") {
                      pair.symbol = "uniswap3arbitrum:" + pair.baseToken.symbol + pair.quoteToken.symbol;
                    } else if (pair.chainId === "optimism") {
                        pair.symbol = "uniswap3op:" + pair.baseToken.symbol + pair.quoteToken.symbol;
                    }
                } else if (pair.dexId === "sushiswap") {
                    pair.symbol = "sushiswap:" + pair.baseToken.symbol + pair.quoteToken.symbol;
                }

                pair.symbolLabel = pair.symbol?.toUpperCase();
            })

            return res.json({
                //etherscanTokenSupply: supply.result,
                pairs: tokenPairs
            });
        } catch (err) {
            console.error(err);
        }
    },
}