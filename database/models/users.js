const bookshelf = require('../../database.js');

let Users = bookshelf.Model.extend({
    tableName: 'users',
    hasTimestamps: true,
})

module.exports = bookshelf.model('Users', Users);