const { addUpdateTsTrigger } = require('../util')

exports.up = async knex => {
  await knex.schema.createTable('permissions', table => {
    table.increments('id').primary()
    table.integer('role_id').notNull()
    table.string('method_pattern').notNull()
    table.string('route_pattern').notNull()
    table.foreign('role_id').references('roles.id')
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await addUpdateTsTrigger(knex, 'permissions')
}

exports.down = function(knex) {
  return knex.schema.dropTable('permissions')
}
