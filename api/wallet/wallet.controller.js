const Wallets = require('../../database/models/wallets');
const Moment = require('moment-timezone');
const Axios = require('axios');
const { Network, Alchemy } = require('alchemy-sdk');
const walletServices = require('./wallet.services');

const settings = {
    apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
    network: Network.ETH_MAINNET, // Replace with your network.
};

module.exports = {
    GET_WALLETS: async (req, res) => {
        console.log('GET_APP_WALLETS');

        try {
            let walletsRaw = await Wallets.fetchAll();
            let wallets = JSON.parse(JSON.stringify(walletsRaw));

            for (let i = 0; i < wallets.length; i++) {
                wallets[i].key = wallets[i].address;
                wallets[i].label = wallets[i].name;
                wallets[i].bottomLeftText = "0x" + wallets[i].address.substr(wallets[i].address.length - 6);
                wallets[i].topRightText = Moment(wallets[i].created_at).format('LL');
            }

            return res.json({
                wallets: wallets,
            })
        } catch (err) {
            console.log(err);
        }
    },
    POST_WALLET: async (req, res) => {
        console.log('POST_APP_WALLETS');

        const { address } = req.body;

        try {
            let saved = await Wallets.where('address', address).fetch();

            return res.json({ wallet: saved });
        } catch (err) {
            if (err.message == 'EmptyResponse') {
                let saved = await new Wallets({ 
                    address: address, 
                    chain: 'ethereum', 
                    name: 'Placeholder'
                }).save(); 

                return res.json({ wallet: saved });
            } else {
                console.log(err);
            }
        }
    },
    PUT_WALLETS: async (req, res) => {
        console.log('PUT_APP_WALLETS');

        const { wallet, name } = req.body;

        try {
            const updated = await Wallets.where('address', wallet).fetch();
            console.log(updated);
            const saved = await updated.save(
            {
                'name': name
            },{ 
                method: 'update'
            });

            return res.json({ saved });
        } catch (error) {
            console.log('Error: ', error.message);
            return res.json({ error });
        }
    },
    GET_WALLET_TOKENS: async (req, res) => {
        const { wallet } = req.params;

        console.log('GET_WALLET_TOKENS');

        const alchemy = new Alchemy(settings);

        if (wallet !== undefined && wallet !== 'undefined') {
            /**
             * Step 1
             * Description: Add native token
             */
            let nativeToken = await alchemy.core.getBalance(wallet);
            let walletTokens = [];
            walletTokens.push({ 
                label: 'ETH', 
                symbol: 'ETH',
                name: 'Ether',
                contractAddress: 'native', 
                walletBalance: (parseInt(nativeToken) / Math.pow(10, 18)),
                decimals: 18
            })

            /**
             * Step 2
             * Description: Loop through tokens and retrieve token metadata
             **/
            let otherTokens = await alchemy.core.getTokenBalances(wallet);
            for (let i = 0; i < otherTokens.tokenBalances.length; i++){
                let data = await alchemy.core.getTokenMetadata(otherTokens.tokenBalances[i].contractAddress);
                
                walletTokens.push({
                    label: data.symbol,
                    contractAddress: otherTokens.tokenBalances[i].contractAddress,
                    walletBalance: parseInt(otherTokens.tokenBalances[i].tokenBalance) / Math.pow(10, data.decimals),
                    ...data
                })
            }

            /**
             * Step 3
             * Filter out tokens with 0 tokens and sort Alphabetically
             */
            walletTokens = walletTokens.filter((token) => token.walletBalance > 0).sort((a, b) => {
                    if (a.label < b.label) return -1;
                    else if (a.label > b.label) return 1;
                    else return 0;
                })

            /**
             * Step 4
             * Description: Pull Token Price Information
             **/
            for (let i=0; i < walletTokens.length; i++) {
                let dexscreener = await Axios.get('https://api.dexscreener.com/latest/dex/search/?q=' + walletTokens[i].symbol + '/USDT');
                
                if (dexscreener.data.pairs.length > 0) {
                    walletTokens[i].stats = dexscreener.data.pairs[0];
                    walletTokens[i].priceUSD = dexscreener.data.pairs[0].priceUsd;
                    walletTokens[i].priceChange1hr = dexscreener.data.pairs[0].priceChange.h1 + '%';
                    walletTokens[i].priceChange24hr = dexscreener.data.pairs[0].priceChange.h24 + '%';
                    walletTokens[i].url = dexscreener.data.pairs[0].url;
                }
            }

            return res.json({
                walletTokens: walletTokens
            });
        } else {
            console.log("WALLET IS UNDEFINED")
        }
    },
    GET_WALLET_TRANSACTIONS: async (req, res) => {
        console.log('GET_WALLET_TRANSACTIONS');

        const { wallet } = req.params;

        try {
            let transactions = await walletServices.GET_50_MOST_RECENT_TRANSACTIONS(wallet, "ethereum");
            
            /**
             * Creating a Dictionary Combining Transactions (To - From & From - To)
             */
            for (let i = 0; i < transactions.length; i++) {
                transactions[i].chain = 'Ethereum';
                transactions[i].value = transactions[i].value?.toFixed(5) || 0.00;
                transactions[i].blockTimestamp = Moment(transactions[i].metadata.blockTimestamp).tz("America/Chicago").format('lll');
                transactions[i].contractAddress = transactions[i].rawContract.address;
                
                if (transactions[i].to.toUpperCase() === wallet.toUpperCase()) {
                    transactions[i].action = "BUY";
                } else if (transactions[i].from.toUpperCase() === wallet.toUpperCase()) {
                    transactions[i].action = "SELL";
                }
            }      
            
            return res.json({
                'walletTransactions': transactions,
            })
        } catch (err) {
            console.error(err);
        }
    },
}