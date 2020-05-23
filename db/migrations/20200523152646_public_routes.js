const { addUpdateTsTrigger } = require('../util')

exports.up = async knex => {
  await knex.schema.createTable('public_routes', table => {
    table.increments('id').primary()
    table.string('method_pattern').notNull()
    table.string('route_pattern').notNull()
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await addUpdateTsTrigger(knex, 'public_routes')
}

exports.down = knex =>
  knex.schema.dropTable('public_routes')

