import db from './db'
import { addLocationTrailPointsToCase } from './locationTrailPoints'


export async function getCase(case_id: number): Promise<Maybe<CaseOutgoingPayload>> {
  const result = await db.raw(`
    WITH lat_lon_points as (
        SELECT id
             , start_ts
             , end_ts
             , ST_X(location::geometry) AS lon
             , ST_Y(location::geometry) AS lat
             , redacted
          FROM location_trail_points
         WHERE case_id = ${case_id}
      ORDER BY start_ts
    ),

    agg_points as (
      SELECT json_agg(row_to_json(lat_lon_points)) as location_trail_points
        FROM lat_lon_points
    )

    SELECT cases.id
         , patient_record_info
         , infection_risk
         , consent_to_make_public_received
         , s1.username as created_by_staff_username
         , s2.username as consent_to_make_public_received_by_staff_username
         , consent_to_make_public_given_at
         , cases.created_at
         , location_trail_points
      FROM cases
      JOIN agg_points on true
 LEFT JOIN staff as s1 on cases.created_by_staff_id = s1.id
 LEFT JOIN staff as s2 on cases.consent_to_make_public_received_by_staff_id = s2.id
     WHERE cases.id = ${case_id}
  `)

  return result.rows[0]
}

// TODO patient_record_info typechecking
// TODO: do this all on the database side, without needing to get the ID back
// TODO: look over the datetime logic with a lot more strictness

export async function openCase({ patient_record_info, location_trail_points, created_by_staff_id }: CaseIncomingPayload): Promise<{ id: number }> {

  let case_id: number // tslint:disable-line:no-let

  // tslint:disable-next-line:no-expression-statement
  await db.transaction(async trx => {
    try {
      const case_ids = await db('cases')
        .transacting(trx)
        .insert({ patient_record_info, created_by_staff_id })
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

  return { id: case_id! }
}

export async function consentToMakePublic(case_id: number, staff_id: number): Promise<{ found: boolean }> {
  const numUpdated = await db.raw(`
    update cases
       set consent_to_make_public_received = true
         , consent_to_make_public_received_by_staff_id = ?
         , consent_to_make_public_given_at = now()
     where id = ?
  `, [staff_id, case_id])

  return { found: Boolean(numUpdated) }
}

export async function delCase(case_id: number): Promise<{ found: boolean }> {
  const numDeleted = await db('cases').where({ id: case_id }).del()
  return { found: Boolean(numDeleted) }
}

export async function getCases(created_before?: string) {
  // TODO: paginate using created_before

  const result = await db.raw(`
       SELECT cases.id
            , patient_record_info
            , infection_risk
            , consent_to_make_public_received
            , s1.username as created_by_staff_username
            , s2.username as consent_to_make_public_received_by_staff_username
            , consent_to_make_public_given_at
            , cases.created_at
         FROM cases
    LEFT JOIN staff as s1 on cases.created_by_staff_id = s1.id
    LEFT JOIN staff as s2 on cases.consent_to_make_public_received_by_staff_id = s2.id
     ORDER BY cases.created_at DESC
        LIMIT 100
  `)

  return result.rows
}
