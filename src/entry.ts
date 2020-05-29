import server from './server/server'

const port = Number(process.env.PORT) || 5004

server.listen(port) // tslint:disable-line:no-expression-statement

console.log(`hotspot-notification-server listening on ${port}`) // tslint:disable-line:no-expression-statement
