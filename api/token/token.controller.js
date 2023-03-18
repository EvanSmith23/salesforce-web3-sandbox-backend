require('dotenv').config();
const Axios = require('axios');

module.exports = {
    GET_TOKEN_PAIRS: async (req, res) => {
        console.log('GET_TOKEN_PAIRS');
        
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
    GET_TOKEN_CATEGORIES: async (req, res) => {
        console.log('GET_TOKEN_CATEGORIES');

        let result = await Axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/categories', {
            'headers': {
                'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY
            }
        });

        let categories = result.data.data.sort((a,b) => {
            if (a.market_cap > b.market_cap) {
                return -1;
            } else if (a.market_cap < b.market_cap) {
                return 1;
            } else {
                return 0;
            }
        })

        for (let i = 0; i < categories.length; i++) {
            categories[i].marketCap = '$' + (categories[i].market_cap).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
            categories[i].marketCapChange = categories[i].market_cap_change.toFixed(2) + '%';
            categories[i].marketVolume = '$' + (categories[i].volume).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
            categories[i].marketVolumeChange = categories[i].volume_change.toFixed(2) + '%';
            categories[i].tokenAverageMarketCap = '$' + (categories[i].market_cap / categories[i].num_tokens).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        }

        return res.json({
            'categories': categories
        })
    }
}