const Wallets = require('../models/wallets');

const knownWallets = [
    {
        'address': '0x71660c4005BA85c37ccec55d0C4493E66Fe775d3',
        'name': 'Coinbase 1',
        'chain': 'ethereum'
    },
    {
        'address': '0x503828976D22510aad0201ac7EC88293211D23Da',
        'name': 'Coinbase 2',
        'chain': 'ethereum'
    },
    {
        'address': '0xddfAbCdc4D8FfC6d5beaf154f18B778f892A0740',
        'name': 'Coinbase 3',
        'chain': 'ethereum'
    },
    {
        'address': '0x3cD751E6b0078Be393132286c442345e5DC49699',
        'name': 'Coinbase 4',
        'chain': 'ethereum'
    },
    {
        'address': '0xb5d85CBf7cB3EE0D56b3bB207D5Fc4B82f43F511',
        'name': 'Coinbase 5',
        'chain': 'ethereum'
    },
    {
        'address': '0xeB2629a2734e272Bcc07BDA959863f316F4bD4Cf',
        'name': 'Coinbase 6',
        'chain': 'ethereum'
    },
]

const importKnownWallets = (knownWallets) => {
    knownWallets.forEach((wallet) => {
        try {
            new Wallets({
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