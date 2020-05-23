import { IRouterContext } from 'koa-router'
import * as passwords from './passwords'
import db from './db'
import * as sessions from './sessions'
import * as cases from './cases'
import * as staff from './staff'


const fromBody = (ctx: IRouterContext, fieldName: string, type: 'string' | 'number' | 'boolean') => {
  const value = ctx.request.body[fieldName]
  if (!value || typeof value !== type) {
    throw { status: 400, message: `Body must include ${fieldName}, a ${type}` }
  }
  return value
}

const getPositiveIntegerParam = (ctx: IRouterContext, fieldName: string) => {
  const id = Number(ctx.params[fieldName])
  if (!id || id < 0 || Math.floor(id) !== id) {
    throw { status: 400, message: `provided ${fieldName} must be an integer > 0` }
  }

  return id
}

export async function createSession(ctx: IRouterContext): Promise<any> {
  const username: string = fromBody(ctx, 'username', 'string')
  const password: string = fromBody(ctx, 'password', 'string')

  const [staffMember] = await db('staff').select('id', 'hashed_password').where({ username })
  if (!staffMember) throw { status: 404, message: `No user (${username})` }

  const match = await passwords.compare(password, staffMember.hashed_password)

  if (match) {
    return (
      await sessions.createSessionForStaffMember(ctx, staffMember.id),
      Object.assign(ctx.response, { status: 200 })
    )
  } else {
    return Object.assign(ctx.response, { status: 401 })
  }
}

export async function delSession(ctx: IRouterContext): Promise<any> {
  return (
    await sessions.removeSessionOfCookie(ctx.request.headers.cookie),
    Object.assign(ctx.response, { status: 200 })
  )
}

export async function getHealthAuthorityInfo(ctx: IRouterContext): Promise<any> {
  return Object.assign(ctx.response, { status: 200, body: { yes: 'please' } })
}

export async function putHealthAuthorityInfo(ctx: IRouterContext): Promise<any> {
  throw new Error('To Be Implemented')
}

export async function getStaff(ctx: IRouterContext): Promise<any> {
  const { role } = ctx.params
  let query = staff.staffWithRoles().select('staff.created_at', 'staff.updated_at') // tslint:disable-line:no-let
  if (role) query = query.where('role', role) // tslint:disable-line:no-expression-statement

  return Object.assign(ctx.response, {
    status: 200,
    body: await query
  })
}

export async function postStaff(ctx: IRouterContext): Promise<any> {
  const username: string = fromBody(ctx, 'username', 'string')
  const password: string = fromBody(ctx, 'password', 'string')
  const { role } = ctx.params
  const contact_info = ctx.request.body.contact_info

  const staffMember = await staff.insertStaff(username, password, role, contact_info)

  return Object.assign(ctx.response, {
    status: 200,
    body: staffMember
  })
}

export async function patchStaff(ctx: IRouterContext): Promise<any> {
  const username: string = fromBody(ctx, 'username', 'string')
  const password: string = fromBody(ctx, 'password', 'string')
  const { role } = ctx.params
}

export async function delStaff(ctx: IRouterContext): Promise<any> {
  const staff_id = getPositiveIntegerParam(ctx, 'staff_id')
  const { role } = ctx.params

  const deleted = await staff.delStaff(staff_id, role)

  return Object.assign(ctx.response, {
    status: deleted ? 200 : 404
  })
}

export async function getSettings(ctx: IRouterContext): Promise<any> {
  throw new Error('To Be Implemented')
}

export async function putSetting(ctx: IRouterContext): Promise<any> {
  throw new Error('To Be Implemented')
}

export async function createAuthcode(ctx: IRouterContext): Promise<any> {
  throw new Error('To Be Implemented')
}

const isoRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})[+-](\d{2})\:(\d{2})$/

export async function postCase(ctx: IRouterContext): Promise<any> {
  const patient_record_info = ctx.request.body.patient_record_info || {}
  const location_trail_points = ctx.request.body.location_trail_points || []

  if (!Array.isArray(location_trail_points)) {
    throw { status: 400, message: 'location_trail_points must be an array' }
  }

  // tslint:disable-next-line:no-expression-statement
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

export async function getCases(ctx: IRouterContext): Promise<any> {
  throw new Error('To Be Implemented')
}

export async function getCase(ctx: IRouterContext): Promise<any> {

  const case_id = getPositiveIntegerParam(ctx, 'case_id')

  const covidCase = await cases.getCase(case_id)

  if (!covidCase) throw { status: 404 }

  return Object.assign(ctx.response, {
    status: 200,
    body: covidCase
  })
}

export async function delCase(ctx: IRouterContext): Promise<any> {
  const case_id = getPositiveIntegerParam(ctx, 'case_id')
  await db('cases').where({ id: case_id }).del()
  return Object.assign(ctx.response, { status: 200 })
}

export async function editPatientRecordInformation(ctx: IRouterContext): Promise<any> {
  throw new Error('To Be Implemented')
}

export async function postLocationTrailPoints(ctx: IRouterContext): Promise<any> {
  throw new Error('To Be Implemented')
}

export async function redactLocationTrailPoint(ctx: IRouterContext): Promise<any> {
  throw new Error('To Be Implemented')
}

export async function getAllHotspots(ctx: IRouterContext): Promise<any> {
  throw new Error('To Be Implemented')
}

export async function getPublichotspots(ctx: IRouterContext): Promise<any> {
  throw new Error('To Be Implemented')
}

export async function getPrivateHotspots(ctx: IRouterContext): Promise<any> {
  throw new Error('To Be Implemented')
}

export async function makeHotspotPublic(ctx: IRouterContext): Promise<any> {
  throw new Error('To Be Implemented')
}
