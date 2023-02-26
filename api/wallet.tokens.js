require('dotenv').config();
const { Network, Alchemy } = require('alchemy-sdk');
const Wallets = require('../database/models/wallets');

const settings = {
    apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
    network: Network.ETH_MAINNET, // Replace with your network.
};

module.exports = {
    GET_WALLET_TOKENS: async (req, res) => {
        const { wallet } = req.params;
        const alchemy = new Alchemy(settings);

        if (wallet !== undefined && wallet !== 'undefined') {
            /**
             * Description: Record wallet connecting to site
             **/
            try {
                const saved = await Wallets.where('address', wallet).fetch();
            } catch (err) {
                if (err.message == 'EmptyResponse') {
                    const saved = await new Wallets({ address: wallet, chain: 'ethereum'}).save(); 
                } else {
                    console.log(err);
                }
            }

            /**
             * Description: Add native token
             */
            let walletTokens = [];
            let nativeToken = await alchemy.core.getBalance(wallet);
            walletTokens.push({ 
                key: 'ETH',
                label: 'ETH', 
                symbol: 'ETH',
                name: 'Ether',
                bottomLeftText: 'native',
                topRightText: (parseInt(nativeToken) / Math.pow(10, 18)),
                contractAddress: 'native', 
                walletBalance: (parseInt(nativeToken) / Math.pow(10, 18)),
            })

            /**
             * Description: Loop through tokens and retrieve token metadata
             **/
            let otherTokens = await alchemy.core.getTokenBalances(wallet);
            console.log(otherTokens);
            for (let i = 0; i < otherTokens.tokenBalances.length; i++){
                let data = await alchemy.core.getTokenMetadata(otherTokens.tokenBalances[i].contractAddress);

                walletTokens.push({
                    key: data.symbol,
                    label: data.symbol,
                    bottomLeftText: otherTokens.tokenBalances[i].contractAddress.substr(otherTokens.tokenBalances[i].contractAddress.length - 6),
                    topRightText: parseInt(otherTokens.tokenBalances[i].tokenBalance) / Math.pow(10, data.decimals),
                    contractAddress: otherTokens.tokenBalances[i].contractAddress,
                    walletBalance: parseInt(otherTokens.tokenBalances[i].tokenBalance) / Math.pow(10, data.decimals),
                    ...data
                })
            }

            return res.json(walletTokens);
        } else {
            console.log("WALLET IS UNDEFINED")
        }
    },
}