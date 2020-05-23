import { IRouterContext, IMiddleware } from 'koa-router'
import * as knexPostgis from 'knex-postgis'
import * as passwords from './passwords'
import db from './db'
import * as sessions from './sessions'


const st = knexPostgis(db)

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

export async function postCase(ctx: IRouterContext) {
  const patient_record_info = ctx.request.body.patient_record_info || {}
  const location_trail_points = ctx.request.body.location_trail_points || []

  // TODO patient_record_info & location_trail_points typechecking
  // TODO: do this all on the database side, without needing to get the ID back
  // TODO: look over the datetime logic with a lot more strictness
  let case_id: number

  await db.transaction(async trx => {
    try {
      const case_ids = await db('cases')
        .transacting(trx)
        .insert({ patient_record_info })
        .returning('id')

      case_id = case_ids[0]

      const location_trail_points_insert = 
        location_trail_points.map((location_trail_point: any) => {
          console.log(location_trail_point.start_ts)

          return {
            case_id,
            location: st.geomFromText(`Point(${location_trail_point.lat} ${location_trail_point.lon})`, 4326),
            start_ts: new Date(location_trail_point.start_ts),
            end_ts: new Date(location_trail_point.end_ts),
          }
        })

      await db('location_trail_points').transacting(trx).insert(location_trail_points_insert)

      return trx.commit()
    } catch (err) {
      return trx.rollback(err)
    }
  })

  return Object.assign(ctx.response, { status: 200, body: { id: case_id! } })
}

export async function getCases(ctx: IRouterContext) {
  throw new Error('To Be Implemented')
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
