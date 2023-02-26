require('dotenv').config();
const Axios = require('axios');
const api = require('etherscan-api').init(process.env.ETHERSCAN_API_KEY, 'arbitrum', '3000');

module.exports = {
    GET_TOKEN_PAIRS: async (req, res) => {
        const { contract } = req.params;
 
        try {
            var supply = await api.stats.tokensupply(null, contract);
            var dexscreener = await Axios.get('https://api.dexscreener.com/latest/dex/tokens/' + contract);
            let pairs = dexscreener.data.pairs.filter((pair) => pair.dexId == 'uniswap' || pair.dexId == 'sushiswap')
            pairs = pairs.sort((a,b) => a.volume.h24 > b.volume.h24)
            pairs.forEach((pair) => {
                console.log(pair);
                pair.name = pair.baseToken.symbol + 'x' + pair.quoteToken.symbol + '_' + pair.chainId + '_' + pair.dexId;
                pair.baseTokenName = pair.baseToken.name;
                pair.baseTokenAddress = pair.baseToken.address;
                pair.quoteTokenName = pair.quoteToken.name;
                pair.quoteTokenAddress = pair.quoteToken.address;
                pair.volume24hr = pair.volume.h24;
                pair.volume6hr = pair.volume.h6;
                pair.volume1hr = pair.volume.h1;
            })

            return res.json({
                etherscanTokenSupply: supply.result,
                pairs: pairs
            });
        } catch (err) {
            console.error(err);
        }
    },
}