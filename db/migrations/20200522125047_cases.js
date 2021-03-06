const { addUpdateTsTrigger } = require('../util')

exports.up = async knex => {
  await knex.schema.createTable('cases', table => {
    table.increments('id').primary()
    table.json('patient_record_info')
    table.float('infection_risk').defaultTo(1)
    table.integer('created_by_staff_id')
    table.foreign('created_by_staff_id').references('staff.id')
    table.boolean('consent_to_make_public_received').defaultTo(false)
    table.timestamp('consent_to_make_public_given_at')
    table.integer('consent_to_make_public_received_by_staff_id')
    table.foreign('consent_to_make_public_received_by_staff_id').references('staff.id')
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await addUpdateTsTrigger(knex, 'cases')
}

exports.down = function(knex) {
  return knex.schema.dropTable('cases')
}
