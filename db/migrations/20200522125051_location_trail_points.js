const { addUpdateTsTrigger } = require('../util')

exports.up = async knex => {
  await knex.raw(`
    CREATE TABLE location_trail_points (
      id SERIAL PRIMARY KEY,
      case_id INTEGER NOT NULL REFERENCES cases(id),
      location GEOGRAPHY(POINT,4326),
      redacted BOOL DEFAULT FALSE,
      start_ts timestamp with time zone,
      end_ts timestamp with time zone
    );
  `)

  await addUpdateTsTrigger(knex, 'location_trail_points')
}

exports.down = function(knex) {
  return knex.schema.dropTable('location_trail_points')
}
