const { addUpdateTsTrigger } = require('../util')

exports.up = async knex => {
  await knex.schema.createTable('roles', table => {
    table.increments('id').primary()
    table.string('role').notNull()
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await addUpdateTsTrigger(knex, 'roles')
}

exports.down = function(knex) {
  return knex.schema.dropTable('roles')
}
