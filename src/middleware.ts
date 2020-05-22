import { IMiddleware, IRouterContext } from 'koa-router'


export const bodyMustInclude = (fieldName: string, type: 'number' | 'string' | 'boolean'): IMiddleware => (ctx, next) => {
  if (!ctx.request.body[fieldName] || typeof ctx.request.body[fieldName] !== type) {
    return Object.assign(ctx.response, { status: 400, body: `Body must include ${fieldName}, a ${type}` })
  }
  next()
}


// TODO
export const attachSession: IMiddleware = (
  async ({ request, response }: IRouterContext, next) => {
    next()
  }
)

export const trackRequests: IMiddleware = (
  async ({ response }: IRouterContext, next) => {

    /* tslint:disable:no-expression-statement */
    try { await next() } catch (err) {
      console.log("HERE!!!", err)
      const status = err.status || 500
      Object.assign(response, { status, body: err.message })
      if (status >= 500) console.error(err)
    }
    /* tslint:enable:no-expression-statement */
  }
)
