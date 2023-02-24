/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('shitcoin', function (table) {
        table.increments('id').primary();
        table.string('symbol');
        table.string('chain');
        table.string('contract');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('shitcoin');
};
