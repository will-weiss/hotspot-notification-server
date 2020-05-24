import * as Router from 'koa-router'
import * as middleware from './middleware'
import * as handlers from './handlers'


const v1Router = new Router()
  .post('/session', handlers.createSession)
  .del('/session', handlers.delSession)
  .get('/health_authority_info', handlers.getHealthAuthorityInfo)
  .put('/health_authority_info/:key', handlers.putHealthAuthorityInfo)
  .get('/staff', handlers.getStaff)
  .get('/staff/:role', handlers.getStaff)
  .post('/staff/:role', handlers.postStaff)
  .patch('/staff/:role/:staff_id', handlers.patchStaff)
  .del('/staff/:role/:staff_id', handlers.delStaff)
  .get('/settings', handlers.getSettings)
  .put('/settings/:setting_id', handlers.putSetting)
  .post('/authcode/create', handlers.createAuthcode)
  .post('/cases', handlers.openCase)
  .get('/cases', handlers.getCases)
  .get('/cases/:case_id', handlers.getCase)
  .del('/cases/:case_id', handlers.delCase)
  .put('/cases/:case_id/patient_record_information', handlers.editPatientRecordInformation)
  .post('/cases/:case_id/location_trail_points', handlers.postLocationTrailPoints)
  .post('/cases/:case_id/location_trail_points/:location_trail_point_id/redact', handlers.setLocationTrailPointRedactedState)
  .post('/cases/:case_id/location_trail_points/:location_trail_point_id/unredact', handlers.setLocationTrailPointRedactedState)
  .post('/cases/:case_id/consent_to_make_public', handlers.consentToMakePublic)
  .get('/hotspots', handlers.getAllHotspots)
  .get('/hotspots/public', handlers.getPublicHotspots)
  .get('/hotspots/private', handlers.getPrivateHotspots)
  .post('/hotspots/private/:hotspot_id/make-public', handlers.makeHotspotPublic)


const router = new Router()
  .get(`/health-check`, ({ response }) => Object.assign(response, { status: 200, body: 'OK' }))
  .redirect('/', '/docs.html')
  .use('/v1', middleware.attachStaffMemberFromSession, middleware.verifyPermissions, v1Router.routes(), v1Router.allowedMethods())

export default router
