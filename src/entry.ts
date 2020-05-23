import server from './server'

const port = Number(process.env.PORT) || 5004

server.listen(port) // tslint:disable-line:no-expression-statement
