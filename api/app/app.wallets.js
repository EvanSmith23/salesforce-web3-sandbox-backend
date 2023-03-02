const Wallets = require('../../database/models/wallets');
const Moment = require('moment');

module.exports = {
    GET_APP_ACCOUNTS: async (req, res) => {
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