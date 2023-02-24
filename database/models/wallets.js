const bookshelf = require('../database.js');

let Wallets = bookshelf.Model.extend({
    tableName: 'wallets',
    hasTimestamps: true,
})

module.exports = bookshelf.model('Wallets', Wallets);