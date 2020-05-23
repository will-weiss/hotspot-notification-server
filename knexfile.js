const pg = require('pg')

pg.defaults.ssl = true

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

if (!process.env.NODE_ENV) {
  throw new Error('Must set NODE_ENV')
}

require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const connection = process.env.DB_URI || {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
}

module.exports = {
  client: 'pg',
  connection,
  migrations: {
    directory: __dirname + '/db/migrations'
  }
};
