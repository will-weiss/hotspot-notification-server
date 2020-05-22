const { addUpdateTsTrigger } = require('../util')

exports.up = async knex => {
  await knex.schema.createTable('health_authority_info_field', table => {
    table.increments('id').primary()
    table.string('key').notNull()
    table.string('value').notNull()
    table.unique('key')
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await addUpdateTsTrigger(knex, 'health_authority_info_field')
}

exports.down = function(knex) {
  return knex.schema.dropTable('health_authority_info_field')
}
