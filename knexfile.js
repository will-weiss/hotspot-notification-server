if (!process.env.NODE_ENV) {
  throw new Error('Must set NODE_ENV')
}

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env'

require('dotenv').config({ path: envFile })

console.log(process.env)

module.exports = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  },
  migrations: {
    directory: __dirname + '/db/migrations'
  }
};
