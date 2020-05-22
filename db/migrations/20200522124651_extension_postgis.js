exports.up = function(knex) {
  return knex.raw(`CREATE EXTENSION POSTGIS;`)
}

exports.down = function(knex) {
  return knex.raw(`DROP EXTENSION POSTGIS;`)
}
