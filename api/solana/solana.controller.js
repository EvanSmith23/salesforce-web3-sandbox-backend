const Axios = require('axios');
const { Connection, ClusterApiUrl, PublicKey } = require('@solana/web3.js');

const web3 = require("@solana/web3.js");

const SOLtoLAMPORT = 0.00000001

module.exports = {
    GET_SOLANA_INFO: async (req, res) => {
        const connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), "confirmed");
        const supply = await connection.getSupply();

        return res.json({
            circulatingSupply: parseInt(supply.value.circulating) * SOLtoLAMPORT,
            nonCirculatingSupply: parseInt(supply.value.nonCirculating) * SOLtoLAMPORT,
            totalSupply: parseInt(supply.value.total) * SOLtoLAMPORT
        });
    },
    GET_SOLANA_ACCOUNT: async (req, res) => {
        let { publicKey } = req.params;
        try {
            const connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), "confirmed");
            const accountInfo = await connection.getAccountInfoAndContext(new PublicKey(publicKey));
            console.log(accountInfo)
            return res.json({
                owner: accountInfo.owner,
                account: {
                    executable: accountInfo.executable,
                    lamports: accountInfo.lamports,
                    rentEpoch: accountInfo.rentEpoch
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

}