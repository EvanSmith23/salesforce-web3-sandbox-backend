require('dotenv').config();
const Wallets = require('../../database/models/wallets');
const Moment = require('moment-timezone');

module.exports = {
    getUser: async (req, res) => {
        console.log('GET_APP_ACCOUNT');

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
    postUser: async (req, res) => {
        console.log('POST_APP_ACCOUNT');

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
    putUser: async (req, res) => {
        console.log('PUT_APP_ACCOUNTS');

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
}