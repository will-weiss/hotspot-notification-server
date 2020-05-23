const { addUpdateTsTrigger } = require('../util')

exports.up = async knex => {
  await knex.schema.createTable('staff', table => {
    table.increments('id').primary()
    table.string('username').notNull()
    table.string('hashed_password').notNull()
    table.integer('role_id').notNull()
    table.json('contact_info')
    table.unique('username')
    table.foreign('role_id').references('roles.id')
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await addUpdateTsTrigger(knex, 'staff')
}

exports.down = function(knex) {
  return knex.schema.dropTable('staff')
}
