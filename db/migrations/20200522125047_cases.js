const { addUpdateTsTrigger } = require('../util')

exports.up = async knex => {
  await knex.schema.createTable('cases', table => {
    table.increments('id').primary()
    table.json('patient_record_info')
    table.float('infection_risk').defaultTo(1)
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await addUpdateTsTrigger(knex, 'cases')
}

exports.down = function(knex) {
  return knex.schema.dropTable('cases')
}
