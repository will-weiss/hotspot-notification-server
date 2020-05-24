import { IMiddleware, IRouterContext } from 'koa-router'
import * as sessions from './sessions'
import * as permissions from './permissions'


export const attachStaffMemberFromSession: IMiddleware = (
  async (ctx: IRouterContext, next) => {
    const loggedInStaffMember = await sessions.getLoggedInStaffMemberFromCookie(ctx.request.headers.cookie)

    if (loggedInStaffMember) {
      Object.assign(ctx, { loggedInStaffMember }) // tslint:disable-line:no-expression-statement
    }

    return next()
  }
)

export const verifyPermissions: IMiddleware = (
  async (ctx: IRouterContext, next) => {
    const role = (ctx as any).loggedInStaffMember?.role
    const isPermitted = permissions.checkPermissions(role, ctx.method, ctx.path)
    if (isPermitted) return next()
    return Object.assign(ctx.response, { status: 403 })
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
