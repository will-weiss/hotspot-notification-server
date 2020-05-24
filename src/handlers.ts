import { IRouterContext } from 'koa-router'
import * as passwords from './passwords'
import db from './db'
import * as sessions from './sessions'
import * as cases from './cases'
import * as staff from './staff'
import * as locationTrailPoints from './locationTrailPoints'


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
  // const username: string = fromBody(ctx, 'username', 'string')
  // const password: string = fromBody(ctx, 'password', 'string')
  // const { role } = ctx.params
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

export async function openCase(ctx: IRouterContext): Promise<any> {
  const patient_record_info = ctx.request.body.patient_record_info || {}
  const location_trail_points = ctx.request.body.location_trail_points || []

  const covidCase = (
    locationTrailPoints.isLocationTrailPoints(location_trail_points),
    await cases.openCase({ patient_record_info, location_trail_points })
  )

  return Object.assign(ctx.response, { status: 200, body: covidCase })
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
  const { found } = await cases.delCase(case_id)
  return Object.assign(ctx.response, { status: found ? 200 : 404 })
}

export async function editPatientRecordInformation(ctx: IRouterContext): Promise<any> {
  throw new Error('To Be Implemented')
}

export async function postLocationTrailPoints(ctx: IRouterContext): Promise<any> {
  const case_id = getPositiveIntegerParam(ctx, 'case_id')
  const { body } = ctx.request
  const location_trail_points = Array.isArray(body) ? body : [body]

  const locationTrailPointIds = (
    locationTrailPoints.isLocationTrailPoints(location_trail_points),
    await locationTrailPoints.addLocationTrailPointsToCase(case_id, location_trail_points).returning('id')
  )

  return Object.assign(ctx.response, {
    status: 200,
    body: location_trail_points.map((point, i) => ({
      id: locationTrailPointIds[i],
      ...point,
    }))
  })
}

export async function setLocationTrailPointRedactedState(ctx: IRouterContext): Promise<any> {
  const redact = !ctx.path.endsWith('/unredact')

  const case_id = getPositiveIntegerParam(ctx, 'case_id')
  const location_trail_point_id = getPositiveIntegerParam(ctx, 'location_trail_point_id')
  const { found } = await locationTrailPoints.setLocationTrailPointRedactedState(case_id, location_trail_point_id, redact)
  return Object.assign(ctx.response, {
    status: found ? 200 : 404
  })
}

export async function consentToMakePublic(ctx: IRouterContext): Promise<any> {
  // TODO: handle mobile consent differently?
  // For manual entry I think we just have to trust verbal consent entered by the staff member.
  // How else could we possibly verify this?

  const case_id = getPositiveIntegerParam(ctx, 'case_id')
  const consent_to_make_public_receieved_by_staff_id = (ctx as any).loggedInStaffMember.id

  const { found } = await cases.consentToMakePublic(case_id, consent_to_make_public_receieved_by_staff_id)
  return Object.assign(ctx.response, {
    status: found ? 200 : 404
  })
}

export async function getAllHotspots(ctx: IRouterContext): Promise<any> {
  throw new Error('To Be Implemented')
}

export async function getPublicHotspots(ctx: IRouterContext): Promise<any> {
  throw new Error('To Be Implemented')
}

export async function getPrivateHotspots(ctx: IRouterContext): Promise<any> {
  throw new Error('To Be Implemented')
}

export async function makeHotspotPublic(ctx: IRouterContext): Promise<any> {
  throw new Error('To Be Implemented')
}
