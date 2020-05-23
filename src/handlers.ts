import { IRouterContext, IMiddleware } from 'koa-router'
import * as passwords from './passwords'
import db from './db'
import * as sessions from './sessions'


const fromBody = (ctx: IRouterContext, fieldName: string, type: 'string' | 'number' | 'boolean') => {
  const value = ctx.request.body[fieldName]
  if (!value || typeof value !== type) {
    throw { status: 400, message: `Body must include ${fieldName}, a ${type}` }
  }
  return value
}


export async function createSession(ctx: IRouterContext) {
  const username: string = fromBody(ctx, 'username', 'string')
  const password: string = fromBody(ctx, 'password', 'string')

  const [staffMember] = await db('staff').select('id', 'hashed_password').where({ username })
  if (!staffMember) throw { status: 404, message: `No user (${username})` }
  
  const match = await passwords.compare(password, staffMember.hashed_password)

  if (match) {
    await sessions.createSessionForStaffMember(ctx, staffMember.id)
    return Object.assign(ctx.response, { status: 200 })
  } else {
    return Object.assign(ctx.response, { status: 401 })
  }
}

export async function delSession(ctx: IRouterContext) {
  ctx.session = null
  Object.assign(ctx.response, { status: 200 })
}

export async function getHealthAuthorityInfo(ctx: IRouterContext) {
  return Object.assign(ctx.response, { status: 200, body: { yes: 'please' } })
}

export async function putHealthAuthorityInfo(ctx: IRouterContext) {

}

export async function getStaff(ctx: IRouterContext) {

}

export async function postStaff(ctx: IRouterContext) {

}

export async function putStaff(ctx: IRouterContext) {

}

export async function delStaff(ctx: IRouterContext) {

}

export async function getSettings(ctx: IRouterContext) {

}

export async function putSetting(ctx: IRouterContext) {

}

export async function createAuthcode(ctx: IRouterContext) {

}

export async function postCase(ctx: IRouterContext) {
  return Object.assign(ctx.response, { status: 200, body: { yes: 'please' } })
}

export async function getCases(ctx: IRouterContext) {

}

export async function delCase(ctx: IRouterContext) {

}

export async function editPatientRecordInformation(ctx: IRouterContext) {

}

export async function postLocationTrailPoints(ctx: IRouterContext) {

}

export async function redactLocationTrailPoint(ctx: IRouterContext) {

}

export async function getAllHotspots(ctx: IRouterContext) {

}

export async function getPublichotspots(ctx: IRouterContext) {

}

export async function getPrivateHotspots(ctx: IRouterContext) {

}

export async function makeHotspotPublic(ctx: IRouterContext) {

}
