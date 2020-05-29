import * as Koa from 'koa'
import bodyParser = require('koa-body')
const cookieParser = require('koa-cookie')
const helmet = require('koa-helmet')
import * as middleware from './middleware'
import router from './router'


const server = new Koa()
  .use(helmet({ noCache: true }))
  .use(({ response }, next) => (
    response.set('Access-Control-Allow-Methods', '*'),
    response.set('Access-Control-Allow-Headers', 'Content-Type'),
    response.set('Access-Control-Allow-Origin', 'http://localhost:3000'),
    next()
  ))
  .use(bodyParser({ multipart: true, jsonLimit: '50mb' }))
  .use(cookieParser.default())
  .use(middleware.trackRequests)
  .use(router.routes())
  .use(router.allowedMethods())

export default server
