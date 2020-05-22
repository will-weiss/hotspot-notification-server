import * as Koa from 'koa'
import * as Router from 'koa-router'
import bodyParser = require('koa-body')
const cookieParser = require('koa-cookie')
const staticAssets = require('koa-static-server')
const helmet = require('koa-helmet')
import * as middleware from './middleware'
import router from './router'


export default new Koa()
  .use(helmet({ noCache: true }))
  .use(bodyParser({ multipart: true, jsonLimit: '50mb' }))
  .use(cookieParser.default())
  .use(middleware.trackRequests)
  .use(router.routes())
  .use(router.allowedMethods())
  .use(staticAssets({ rootDir: 'public' }))
