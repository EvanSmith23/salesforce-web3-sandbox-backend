require('dotenv').config();
const Axios = require('axios');
const api = require('etherscan-api').init(process.env.ETHERSCAN_API_KEY, 'arbitrum', '3000');
const { Network, Alchemy } = require('alchemy-sdk');

const settings = {
    apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
    network: Network.ETH_MAINNET, // Replace with your network.
};

module.exports = {
    GET_ETHERSCAN: async (req, res) => {
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
    GET_ETH_ACCOUNT_INFO: async (req, res) => {
        const { wallet } = req.params;
        const alchemy = new Alchemy(settings);

        let walletTokens = [];
        try {
            if (wallet !== undefined && wallet !== 'undefined') {
                /**
                 * 
                 * TODO: INSERT WALLET INTO WALLET TABLE
                 * CHECK IF ALREADY EXISTS
                 * 
                 * 
                 */
                const eth = await alchemy.core.getBalance(wallet);

                console.log("eth: ", parseInt(eth));

                const tokens = await alchemy.core.getTokenBalances(wallet);
                
                for (let i = 0; i < tokens.tokenBalances.length; i++){
                    let data = await alchemy.core.getTokenMetadata(tokens.tokenBalances[i].contractAddress);
                    walletTokens.push({
                        contractAddress: tokens.tokenBalances[i].contractAddress,
                        walletBalance: tokens.tokenBalances[i].tokenBalance,
                        ...data
                    })
                    
                }
                //console.log(walletTokens);
                return res.json(walletTokens);
            } else {
                console.log('-- here2 --')
            }
        } catch (err) {
            console.error(err);
        }
    },
    GET_WALLET_TRANSACTIONS: async (req, res) => {
        const { wallet } = req.params;

        console.log('GET_WALLET_TRANSACTIONS');

        try {
            let result = await Axios.get('https://api.etherscan.io/api?module=account&action=tokentx&address=' + wallet + '&sort=desc&apikey=' + process.env.ETHERSCAN_API_KEY)// + process.env.ETHERSCAN_API_KEY)
        
            // console.log(result.data);

            return res.json({'transactions':result.data})
        } catch (err) {
            console.error(err);
        }
    }
}