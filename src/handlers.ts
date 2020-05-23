import { IRouterContext, IMiddleware } from 'koa-router'
import * as passwords from './passwords'
import db from './db'
import * as sessions from './sessions'
import * as cases from './cases'


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
  throw new Error('To Be Implemented')
  ctx.session = null
  Object.assign(ctx.response, { status: 200 })
}

export async function getHealthAuthorityInfo(ctx: IRouterContext) {
  return Object.assign(ctx.response, { status: 200, body: { yes: 'please' } })
}

export async function putHealthAuthorityInfo(ctx: IRouterContext) {
  throw new Error('To Be Implemented')
}

export async function getStaff(ctx: IRouterContext) {
  throw new Error('To Be Implemented')
}

export async function postStaff(ctx: IRouterContext) {
  throw new Error('To Be Implemented')
}

export async function putStaff(ctx: IRouterContext) {
  throw new Error('To Be Implemented')
}

export async function delStaff(ctx: IRouterContext) {
  throw new Error('To Be Implemented')
}

export async function getSettings(ctx: IRouterContext) {
  throw new Error('To Be Implemented')
}

export async function putSetting(ctx: IRouterContext) {
  throw new Error('To Be Implemented')
}

export async function createAuthcode(ctx: IRouterContext) {
  throw new Error('To Be Implemented')
}

// const isoRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})\.(\d{3})Z$/
const isoRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})[+-](\d{2})\:(\d{2})$/

export async function postCase(ctx: IRouterContext) {
  const patient_record_info = ctx.request.body.patient_record_info || {}
  const location_trail_points = ctx.request.body.location_trail_points || []

  if (!Array.isArray(location_trail_points)) {
    throw { status: 400, message: 'location_trail_points must be an array' }
  }

  location_trail_points.forEach(({ lat, lon, start_ts, end_ts }: any, i) => {
    if (typeof lat !== 'number') {
      throw { status: 400, message: `lat must be a number, but it was not at location_trail_points[${i}]` }
    }
    if (typeof lon !== 'number') {
      throw { status: 400, message: `lon must be a number, but it was not at location_trail_points[${i}]` }
    }
    if (!isoRegex.test(start_ts)) {
      throw { status: 400, message: `start_ts must be a string in ISO format, but it was not at location_trail_points[${i}]` }
    }
    if (!isoRegex.test(end_ts)) {
      throw { status: 400, message: `end_ts must be a string in ISO format, but it was not at location_trail_points[${i}]` }
    }
  })

  const case_id: number = await cases.postCase({ patient_record_info, location_trail_points })

  return Object.assign(ctx.response, { status: 200, body: { id: case_id! } })
}

export async function getCases(ctx: IRouterContext) {
  throw new Error('To Be Implemented')
}

export async function getCase(ctx: IRouterContext) {

  const case_id = Number(ctx.params.case_id)
  if (!case_id || case_id < 0 || Math.floor(case_id) !== case_id) {
    throw { status: 400, message: `provided case_id must be an integer > 0` }
  }

  const covidCase = await cases.getCase(case_id)

  if (!covidCase) throw { status: 404 }

  return Object.assign(ctx.response, {
    status: 200,
    body: covidCase
  })
}

export async function delCase(ctx: IRouterContext) {
  throw new Error('To Be Implemented')
}

export async function editPatientRecordInformation(ctx: IRouterContext) {
  throw new Error('To Be Implemented')
}

export async function postLocationTrailPoints(ctx: IRouterContext) {
  throw new Error('To Be Implemented')
}

export async function redactLocationTrailPoint(ctx: IRouterContext) {
  throw new Error('To Be Implemented')
}

export async function getAllHotspots(ctx: IRouterContext) {
  throw new Error('To Be Implemented')
}

export async function getPublichotspots(ctx: IRouterContext) {
  throw new Error('To Be Implemented')
}

export async function getPrivateHotspots(ctx: IRouterContext) {
  throw new Error('To Be Implemented')
}

export async function makeHotspotPublic(ctx: IRouterContext) {
  throw new Error('To Be Implemented')
}
