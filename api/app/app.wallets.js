const Wallets = require('../../database/models/wallets');
const Moment = require('moment');

module.exports = {
    POST_APP_WALLET: async (req, res) => {
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
    PUT_APP_WALLET: async (req, res) => {
        console.log('PUT_APP_WALLET');

        const { info } = req.body;

        try {
            const updated = await Wallet.where('wallet', info.wallet).fetch();
            const saved = await updated.save(info, { method: 'update'});

            return res.json({ saved });
        } catch (error) {
            return res.json({ error });
        }
    },
    GET_APP_WALLETS: async (req, res) => {
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
    }
}