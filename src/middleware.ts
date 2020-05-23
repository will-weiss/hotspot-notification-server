import { IMiddleware, IRouterContext } from 'koa-router'
import * as sessions from './sessions'


// TODO
export const attachStaffMemberFromSession: IMiddleware = (
  async (ctx: IRouterContext, next) => {
    const sessionKey = sessions.extractSessionKeyFromCookie(ctx.request.headers.cookie)
    const associatedStaffMember = sessionKey && await sessions.getAssociatedStaffMember(sessionKey)

    if (associatedStaffMember) {
      Object.assign(ctx, { associatedStaffMember })
    }

    return next()  
  }
)

export const verifyPermissions: IMiddleware = (
  async (ctx: IRouterContext, next) => {
    console.log('verifyPermissions', (ctx as any).associatedStaffMember)
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
