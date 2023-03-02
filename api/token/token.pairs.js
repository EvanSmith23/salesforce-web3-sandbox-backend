require('dotenv').config();
const Axios = require('axios');

module.exports = {
    GET_TOKEN_PAIRS: async (req, res) => {
        const { symbol } = req.params;
 
        try {
            /**
             * Dexscreener API: Review -- Pretty Weak
             * 3 Endpoints:
             * 1. Get Pairs by pairAddress
             * 2. Get Pairs by Token
             * 3. Get Pairs by Query (Token Symbol, Token Name, Token Address, Pair Address)
             */
            let dexscreener = await Axios.get('https://api.dexscreener.com/latest/dex/search/?q=' + symbol);
            let pairs = dexscreener.data.pairs.filter((pair) => pair.dexId == 'uniswap' || pair.dexId == 'sushiswap' || pair.dexId == 'pancakeswap')
            let tokenPairs = pairs.sort((a,b) => a.volume.h24 > b.volume.h24)

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
                 * Setup Symbol Parameter for Trading View Chart
                 * uniswap = uniswap3eth, uniswap3arbitrum
                 * - not sure about arbitrum
                 * sushiswap = sushiswap (no need to identify the chain)\
                 * - does it use Layer 2s?
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
                }

                pair.symbolLabel = pair.symbol?.toUpperCase();
            })

            return res.json({
                tokenPairs: tokenPairs
            });
        } catch (err) {
            console.error(err);
        }
    },
}