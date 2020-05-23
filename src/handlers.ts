import { IRouterContext, IMiddleware } from 'koa-router'
import * as passwords from './passwords'
import db from './db'


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

  const [staffMember] = await db('staff').select('hashed_password').where({ username })
  if (!staffMember) throw { status: 404, message: `No user (${username})` }
  
  const match = await passwords.compare(password, staffMember.hashed_password)

  if (match) {
    return Object.assign(ctx.response, { status: 200, body: { yes: 'please' } })
  } else {
    return Object.assign(ctx.response, { status: 401, body: 'nope' })
  }
}

export async function delSession() {

}

export async function getHealthAuthorityInfo(ctx: IRouterContext) {
  return Object.assign(ctx.response, { status: 200, body: { yes: 'please' } })
}

export async function putHealthAuthorityInfo() {

}

export async function getStaff() {

}

export async function postStaff() {

}

export async function putStaff() {

}

export async function delStaff() {

}

export async function getSettings() {

}

export async function putSetting() {

}

export async function createAuthcode() {

}

export async function postCase() {

}

export async function getCases() {

}

export async function delCase() {

}

export async function editPatientRecordInformation() {

}

export async function postLocationTrailPoints() {

}

export async function redactLocationTrailPoint() {

}

export async function getAllHotspots() {

}

export async function getPublichotspots() {

}

export async function getPrivateHotspots() {

}

export async function makeHotspotPublic() {

}
