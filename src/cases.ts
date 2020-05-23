import * as knexPostgis from 'knex-postgis'
import db from './db'
import { addLocationTrailPointsToCase } from './locationTrailPoints'


export async function getCase(case_id: number): Promise<Maybe<CaseOutgoingPayload>> {
  const result = await db.raw(`
    with lat_lon_points as (
      SELECT
        id,
        start_ts,
        end_ts,
        ST_X(location::geometry) AS lon,
        ST_Y(location::geometry) AS lat
      FROM location_trail_points
      where case_id = ${case_id}
    ),

    agg_points as (
      select json_agg(row_to_json(lat_lon_points)) as location_trail_points
        from lat_lon_points
    )

    select id
         , patient_record_info
         , infection_risk
         , location_trail_points
      from cases
      join agg_points on true
     where id = ${case_id}
  `)

  return result.rows[0]
}

// TODO patient_record_info typechecking
// TODO: do this all on the database side, without needing to get the ID back
// TODO: look over the datetime logic with a lot more strictness

export async function postCase({ patient_record_info, location_trail_points }: CaseIncomingPayload): Promise<number> {

  let case_id: number // tslint:disable-line:no-let

  // tslint:disable-next-line:no-expression-statement
  await db.transaction(async trx => {
    try {
      const case_ids = await db('cases')
        .transacting(trx)
        .insert({ patient_record_info })
        .returning('id')

      case_id = case_ids[0] // tslint:disable-line:no-expression-statement

      return (
        await addLocationTrailPointsToCase(case_id, location_trail_points, trx),
        trx.commit()
      )
    } catch (err) {
      return trx.rollback(err)
    }
  })

  return case_id!
}
