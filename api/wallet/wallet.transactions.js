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
        const { wallet } = req.params;
        const alchemy = new Alchemy(settings);

        console.log('GET_WALLET_TRANSACTIONS');

        let walletsRaw = await Wallets.fetchAll()
        let knownWallets = JSON.parse(JSON.stringify(walletsRaw));

        let walletsMap = {}
        for (let i = 0; i < knownWallets.length; i++){
            walletsMap[knownWallets[i].address] = knownWallets[i];
        }

        try {
            /**
             * Using Alchemy
             * Note: Etherscan requires API Pro to access any decent transaction endpoints
             * - Etherscan API Pro Lowest Plan: $199 per month (wtf)
             *
             * Overview:
             * Type-0 Transactions (legacy transactions)
             * Type-2 Transactions: EIP-1559 (London Upgrade - Aug 2021)
             * Details:
             * Type 0: Gas Price
             * became
             * Type 2: Max Priority Fee Per Gas = the tip the sender is willing to send the miner
             *    &
             *    Max Fee Per Gas = max price per gas unit the sender is willing to pay for the transaction
             * Also: Gwei =  Giga Wei
            */

            let assetTransfersTo = await alchemy.core.getAssetTransfers({
                // fromBlock: '0x0',
                // toBlock: 'latest',
                // fromAddress: wallet,
                toAddress: wallet,
                category: ['external', "erc20", "erc721", "erc1155", "specialnft"],
                withMetadata: true,
                excludeZeroValue: true,
            });

            let assetTransfersFrom = await alchemy.core.getAssetTransfers({
                // fromBlock: '0x0',
                // toBlock: 'latest',
                fromAddress: wallet,
                // toAddress: wallet,
                category: ['external', "erc20", "erc721", "erc1155", "specialnft"],
                withMetadata: true,
                excludeZeroValue: true,
                order: 'desc'
            });

            let transactions = assetTransfersTo.transfers.concat(assetTransfersFrom.transfers)
            let txMatches = {};
            for (let i = 0; i < transactions.length; i++) {
                transactions[i].blockTimestamp = transactions[i].metadata.blockTimestamp;
                transactions[i].contractAddress = transactions[i].rawContract.address;
                console.log(transactions[i].to);
                if (knownWallets[transactions[i].to] !== undefined) {
                    console.log(knownWallets[transactions[i].to].name)
                }

                if (knownWallets[transactions[i].from] !== undefined) {
                    console.log(knownWallets[transactions[i].from].name)
                } 
                
                if (txMatches[transactions[i].hash] !== undefined) {
                    txMatches[transactions[i].hash].push(transactions[i]);
                } else {
                    txMatches[transactions[i].hash] = [transactions[i]]
                }

                // let tx = await alchemy.core.getTransaction(transactions[i].hash);
                // console.log(parseInt(tx.gasPrice) / Math.pow(10, 10));
                // let txReceipt = await alchemy.core.getTransactionReceipt(transactions[i].hash);
                // console.log(parseInt(txReceipt));
                //console.log(parseInt(tx.gasPrice) / Math.pow(10, 10));
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