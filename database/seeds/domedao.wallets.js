0xadf27ee1A23D5Df947d37CF65f1a10872e03d333
const User = require('../models/users');

const knownWallets = [
    {
        'address': '0xEBe035dA5DF98E8297D31cFD1c249732a6d6d3bA',
        'name': 'Evan',
        'chain': 'ethereum'
    },
    {
        'address': '0xadf27ee1A23D5Df947d37CF65f1a10872e03d333',
        'name': 'Soham',
        'chain': 'ethereum'
    }
]

const importKnownWallets = (knownWallets) => {
    knownWallets.forEach((wallet) => {
        try {
            new User({
                'address': wallet.address,
                'name': wallet.name,
                'chain': wallet.chain
            }).save();
        } catch (err) {
            console.erroer(err);
        }
    })
}

importKnownWallets(knownWallets);