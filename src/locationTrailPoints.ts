import { Transaction, QueryBuilder } from 'knex'
import * as knexPostgis from 'knex-postgis'
import db from './db'


const st = knexPostgis(db)

const isoRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})[+-](\d{2})\:(\d{2})$/


export function isLocationTrailPoints(location_trail_points: any): location_trail_points is LocationTrailPointsIncomingPayload {
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

  return true
}

export function addLocationTrailPointsToCase(
  case_id: number,
  location_trail_points: LocationTrailPointsIncomingPayload,
  trx?: Transaction<any, any>
): QueryBuilder<any, any> {

  const location_trail_points_insert = location_trail_points.map(({ lat, lon, start_ts, end_ts }: any) => ({
    case_id,
    location: st.geomFromText(`Point(${lon} ${lat})`, 4326),
    start_ts: new Date(start_ts),
    end_ts: new Date(end_ts),
  }))

  let query = db('location_trail_points') // tslint:disable-line:no-let
  if (trx) query = query.transacting(trx) // tslint:disable-line:no-expression-statement
  return query.insert(location_trail_points_insert)
}

export async function setLocationTrailPointRedactedState(case_id: number, location_trail_point_id: number, redacted: boolean): Promise<{ found: boolean }> {
  const numUpdated = await (
    db('location_trail_points')
      .update({ redacted })
      .where({ case_id, id: location_trail_point_id })
  )

  return { found: Boolean(numUpdated) }
}
