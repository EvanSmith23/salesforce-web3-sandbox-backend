const bookshelf = require('../database.js');

let LikedCollections = bookshelf.Model.extend({
    tableName: 'liked_collections',
    hasTimestamps: true,
})

module.exports = bookshelf.model('LikedCollections', LikedCollections);