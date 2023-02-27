require('dotenv').config();
const Axios = require('axios');

module.exports = {
    GET_WALLET_TRANSACTIONS: async (req, res) => {
        const { wallet } = req.params;

        try {
            let result = await Axios.get('https://api.etherscan.io/api?module=account&action=tokentx&address=' + wallet + '&sort=desc&apikey=' + process.env.ETHERSCAN_API_KEY)// + process.env.ETHERSCAN_API_KEY)
        
            return res.json({
                'transactions':result.data
            })
        } catch (err) {
            console.error(err);
        }
    }
}