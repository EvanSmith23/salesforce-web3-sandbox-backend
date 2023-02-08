/**
 * Database module.
 * @module database
 */
require('dotenv').config();

const env = process.env.NODE_ENV || 'local';

const config = require('./knexfile')[env];

const knex = require('knex')(config);
const bookshelf = require('bookshelf')(knex);

bookshelf.plugin('registry');

module.exports = bookshelf;
