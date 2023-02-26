const Axios = require('axios');
const MagicEdenServices = require('./magic-eden.services');

module.exports = {
    GET_MAGIC_EDEN_COLLECTIONS: async (req, res) => {
        try {
            let collections = await Axios.get('https://api-mainnet.magiceden.dev/v2/collections?offset=0&limit=500');

            let tmp = {}
            for (let i = 0; i < collections.data.length; i++) {
                tmp[collections.data[i].symbol] = collections.data[i];
            }

            return res.json({
                collections: tmp,
            })
        } catch (err) {
            console.error(err.message);
        }
    },
    GET_MAGIC_EDEN_COLLECTION: async (req, res) => {
        let { collection } = req.params;

        try {
            let listings = await Axios.get('https://api-mainnet.magiceden.dev/v2/collections/' + collection + '/listings');
            let stats = await Axios.get('https://api-mainnet.magiceden.dev/v2/collections/' + collection + '/stats');
            let activities = await MagicEdenServices.getCollectionActivites(collection, 250);

            return res.json({
                listings: listings.data,
                activities: activities,
                stats: stats.data
            })
        } catch (err) { 
            console.error(err.message); 
        }
    },
    GET_MAGIC_EDEN_TOKEN: async (req, res) => {
        let { token } = req.params;

        try {
            let token_info = await Axios.get('https://api-mainnet.magiceden.dev/v2/tokens/' + token);
            let listings = await Axios.get('https://api-mainnet.magiceden.dev/v2/tokens/' + token + '/listings');
            let activities = await Axios.get('https://api-mainnet.magiceden.dev/v2/tokens/' + token + '/activities?offset=0&limit=500');

            let tmp = [], offset = 0;
            do {
                let offers_received = await Axios.get('https://api-mainnet.magiceden.dev/v2/tokens/' + token + '/offers_received?offset=' + offset + '&limit=20');

                tmp.concat(offers_received);

                console.log(offers_received);
            } while (offset < 10)
            console.log(tmp.length);
            return res.json({
                info: token_info,
                listings: listings,
                offers_received: offers_received,
                activities: activities
            })
        } catch (err) {
            console.error(err.message)
        }
    },
    GET_MAGIC_EDEN_WALLET: async (req, res) => {
        let { wallet } = req.params;

        try {
            let wallet_info = await Axios.get('https://api-mainnet.magiceden.dev/v2/wallets/' + wallet);
            let tokens = await Axios.get('https://api-mainnet.magiceden.dev/v2/wallets/' + wallet + '/tokens?offset=0&limit=100&listStatus=both');
            let listings = Axios.get('https://api-mainnet.magiceden.dev/v2/wallets/' + wallet);
            let activities = Axios.get('https://api-mainnet.magiceden.dev/v2/wallets/' + wallet + '/activities?offset=0&limit=100');
            let offersMade = Axios.get('https://api-mainnet.magiceden.dev/v2/wallets/' + wallet + '/offers_made?offset=0&limit=100');
            let offersReceived = Axios.get('https://api-mainnet.magiceden.dev/v2/wallets/' + wallet + '/offers_received?offset=0&limit=100');
            let escrowBalance = Axios.get('https://api-mainnet.magiceden.dev/v2/wallets/' + wallet + '/escrow_balance');

            let tmp = [];
            for (const i in activities.data) {
                let tmp2 = activities.data[i];

                tmp2['date'] = moment(activities.data[i].blockTime * 1000).format('L');
                
                tmp.push(tmp2);
            }

            console.log(wallet_info.data)

            return res.json({
                wallet_info: wallet_info.data,
                wallet_tokens: tokens.data || [],
                wallet_listings: listings.data || [],
                wallet_activities: tmp || [],
                wallet_offers_made: offersMade.data || [],
                wallet_offers_received: offersReceived.data || [],
                wallet_escrow_balance: escrowBalance.data || []
            })
        } catch (err) {
            console.error(err.message)
        }
    },
}