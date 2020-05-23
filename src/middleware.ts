import { IMiddleware, IRouterContext } from 'koa-router'


// TODO
export const attachSession: IMiddleware = (
  async ({ request, response }: IRouterContext, next) => {
    await next()
  }
)

export const verifyPermissions: IMiddleware = (
  async ({ request, response }: IRouterContext, next) => {
    await next()
  }
)

export const trackRequests: IMiddleware = (
  async ({ response }: IRouterContext, next) => {

    /* tslint:disable:no-expression-statement */
    try { await next() } catch (err) {
      const status = err.status || 500
      Object.assign(response, { status, body: err.message })
      if (status >= 500) console.error(err)
    }
    /* tslint:enable:no-expression-statement */
  }
)
