
type LocationTrailPointIncomingPayload = {
  lat: number
  lon: number
  start_ts: string
  end_ts: string
}

type LocationTrailPointsIncomingPayload = ReadonlyArray<LocationTrailPointIncomingPayload>

type CaseIncomingPayload = {
  patient_record_info: any
  location_trail_points: ReadonlyArray<LocationTrailPointIncomingPayload>
  infection_risk?: number
}

type CaseOutgoingPayload = CaseIncomingPayload & {
  id: number
  infection_risk: number
}
