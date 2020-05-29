import { IRouterContext } from 'koa-router'
const hogan = require('hogan.js')
import { readdirSync, readFileSync, fstat } from 'fs'
import { join } from 'path'


const viewsDir = join(__dirname, '..', 'views')
const partialsDir = join(viewsDir, 'partials')

const partials = readdirSync(partialsDir)
  .filter(path => path.endsWith('.mustache'))
  .reduce((partials, path) => ({
    ...partials,
    [path.replace('.mustache', '')]: readFileSync(join(partialsDir, path), 'utf8')
  }), {})

const views: any = readdirSync(viewsDir)
  .filter(path => path.endsWith('.mustache'))
  .reduce((views, path) => ({
    ...views,
    [path.replace('.mustache', '')]: hogan.compile(readFileSync(join(viewsDir, path), 'utf8'))
  }), {})


export default function(ctx: IRouterContext, viewName: string, data?: any): void {
  ctx.type = 'html'
  ctx.body = views[viewName].render(data, partials)
}
