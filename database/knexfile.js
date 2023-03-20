/**
 * Knexfile module.
 * @module knexfile
 */
require('dotenv').config();

// Update with your config settings.
module.exports = {
  local: {
    client: 'postgresql',
    connection: {
      database: 'domedao',
    },
    debug: false,
  },
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
    debug: true,
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
    debug: true,
  },
};
