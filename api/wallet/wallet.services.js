const { Network, Alchemy } = require('alchemy-sdk');

const settings = {
    apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
    network: Network.ETH_MAINNET, // Replace with your network.
};

module.exports = {
    GET_50_MOST_RECENT_TRANSACTIONS: async (wallet, chain) => {
        const alchemy = new Alchemy(settings);

        let assetTransfersFrom = [], assetTransfersTo = [];

        if (chain === "ethereum") {
            assetTransfersFrom = await alchemy.core.getAssetTransfers({
                fromAddress: wallet,
                category: ['external', "erc20", "erc721", "erc1155", "specialnft"],
                withMetadata: true,
                excludeZeroValue: true,
                order: 'desc'
            });

            assetTransfersTo = await alchemy.core.getAssetTransfers({
                toAddress: wallet,
                category: ['external', "erc20", "erc721", "erc1155", "specialnft"],
                withMetadata: true,
                excludeZeroValue: true,
                order: 'desc'
            });
        }

        let txBoth = assetTransfersFrom.transfers.concat(assetTransfersTo.transfers)
        
        return txBoth.sort((a,b) => {
            if (new Date(a.metadata.blockTimestamp).getTime() < new Date(b.metadata.blockTimestamp).getTime()) {
                return 1;
            } else if (new Date(a.metadata.blockTimestamp).getTime() > new Date(b.metadata.blockTimestamp).getTime()) {
                return -1;
            } else {
                return 0;
            }
        }).slice(0,50);
    }
}