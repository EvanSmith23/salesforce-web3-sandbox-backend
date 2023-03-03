require('dotenv').config();
const Axios = require('axios');
const Web3 = require('web3');
const web3 = new Web3('https://eth-mainnet.alchemyapi.io/v2/' + process.env.ALCHEMY_API_KEY);
const { Network, Alchemy } = require('alchemy-sdk');
const Wallets = require('../../database/models/wallets');

const settings = {
    apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
    network: Network.ETH_MAINNET, // Replace with your network.
};

module.exports = {
    GET_WALLET_TRANSACTIONS: async (req, res) => {
        console.log('GET_WALLET_TRANSACTIONS');

        const { wallet } = req.params;
        const alchemy = new Alchemy(settings);

        let walletsRaw = await Wallets.fetchAll()
        let knownWallets = JSON.parse(JSON.stringify(walletsRaw));
        let walletsMap = {};
        for (let i = 0; i < knownWallets.length; i++){
            walletsMap[knownWallets[i].address] = knownWallets[i];
        }

        try {
            /**
             * Pull All Asset Transfers involving a wallet
             */
            let assetTransfersTo = await alchemy.core.getAssetTransfers({
                toAddress: wallet,
                category: ['external', "erc20", "erc721", "erc1155", "specialnft"],
                withMetadata: true,
                excludeZeroValue: true,
            });

            let assetTransfersFrom = await alchemy.core.getAssetTransfers({
                fromAddress: wallet,
                category: ['external', "erc20", "erc721", "erc1155", "specialnft"],
                withMetadata: true,
                excludeZeroValue: true,
                order: 'desc'
            });

            let transactions = assetTransfersTo.transfers.concat(assetTransfersFrom.transfers)
            
            /**
             * Creating a Dictionary Combining Transactions (To - From & From - To)
             */
            let txMatches = {};
            for (let i = 0; i < transactions.length; i++) {
                transactions[i].blockTimestamp = transactions[i].metadata.blockTimestamp;
                transactions[i].contractAddress = transactions[i].rawContract.address;

                if (txMatches[transactions[i].hash] !== undefined) {
                    txMatches[transactions[i].hash].push(transactions[i]);
                } else {
                    txMatches[transactions[i].hash] = [transactions[i]]
                }
            }

            return res.json({
                'walletTransactions': transactions,
                'txMatches': txMatches
            })
        } catch (err) {
            console.error(err);
        }
    }
}