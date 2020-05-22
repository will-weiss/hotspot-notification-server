import * as Router from 'koa-router'
import { bodyMustInclude } from './middleware'
import * as handlers from './handlers'


const v1Router = new Router()
  .post('/session', bodyMustInclude('username', 'string'), bodyMustInclude('password', 'string'), handlers.createSession)
  .del('/session', handlers.delSession)
  .get('/health_authority_info', handlers.getHealthAuthorityInfo)
  .put('/health_authority_info/$key', handlers.putHealthAuthorityInfo)
  .get('/staff', handlers.getStaff)
  .post('/staff', bodyMustInclude('username', 'string'), bodyMustInclude('password', 'string'), bodyMustInclude('role', 'string'), handlers.postStaff)
  .put('/staff/$health_authority_staff_id', handlers.putStaff)
  .del('/staff/$health_authority_staff_id', handlers.delStaff)
  .get('/settings', handlers.getSettings)
  .put('/settings/$setting_id', handlers.putSetting)
  .post('/authcode/create', handlers.createAuthcode)
  .post('/cases', handlers.postCase)
  .get('/cases', handlers.getCases)
  .del('/cases/$case_id', handlers.delCase)
  .put('/cases/$case_id/patient_record_information', handlers.editPatientRecordInformation)
  .post('/cases/$case_id/location_trail_points', handlers.postLocationTrailPoints)
  .post('/cases/$case_id/location_trail_points/$location_trail_point_id/redact', handlers.redactLocationTrailPoint)
  .get('/hotspots', handlers.getAllHotspots)
  .get('/hotspots/public', handlers.getPublichotspots)
  .get('/hotspots/private', handlers.getPrivateHotspots)
  .post('/hotspots/private/$hotspot_id/make-public', handlers.makeHotspotPublic)


const router = new Router()
  .get(`/health-check`, ({ response }) => Object.assign(response, { status: 200, body: 'OK' }))
  .redirect('/', '/docs.html')
  .use('/v1',  v1Router.routes(), v1Router.allowedMethods())

export default router
