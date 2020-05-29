// tslint:disable:no-let
// tslint:disable:no-expression-statement
import { expect } from 'chai'
import * as request from 'supertest'
import * as permissions from '../server/permissions'
import db from '../server/db'
import server from '../server/server'
const { seed } = require('../../db/seeds/two_role_three_user')


describe('end-to-end', () => {

  let app: any
  let adminAgent: request.SuperTest<request.Test>
  let contactTracerAgent: request.SuperTest<request.Test>
  let notLoggedInAgent: request.SuperTest<request.Test>

  before(() => seed(db))
  before(permissions.readPermissionsIntoMemory)
  before(() => app = server.listen(5005))
  before(() => {
    adminAgent = request.agent(app)
    contactTracerAgent = request.agent(app)
    notLoggedInAgent = request.agent(app)
  })

  after(() => app && app.close())
  after(() => db.destroy()) // Leave the database contents alone in case these are useful to inspect after tests have run

  describe('contact_tracer', () => {
    it('400s when POST to /session has no password', done => {
      contactTracerAgent
        .post('/api/v1/session')
        .send({ username: 'contact_tracer_1' })
        .expect(400)
        .end(done)
    })

    it('400s when POST to /session has no username', done => {
      contactTracerAgent
        .post('/api/v1/session')
        .send({ password: 'pw_contact_tracer_1' })
        .expect(400)
        .end(done)
    })

    it('401s when POST to /session has incorrect password', done => {
      contactTracerAgent
        .post('/api/v1/session')
        .send({ username: 'contact_tracer_1', password: 'whoops-pw_contact_tracer_1' })
        .expect(401)
        .end(done)
    })

    it('404s when POST to /session is nonexistent user', done => {
      contactTracerAgent
        .post('/api/v1/session')
        .send({ username: 'contact_tracer_77', password: 'pw_contact_tracer_1' })
        .expect(404)
        .end(done)
    })

    it('200s when POST to /session has correct username and password', done => {
      contactTracerAgent
        .post('/api/v1/session')
        .send({ username: 'contact_tracer_1', password: 'pw_contact_tracer_1' })
        .expect(200)
        .expect(res => {
          expect(res.header).to.have.property('set-cookie')
        })
        .end(done)
    })

    it('403s when a not logged in staff member attempts to POST to /cases', done => {
      notLoggedInAgent
        .post('/api/v1/cases')
        .send({
          patient_record_info: { some: 'metadata' },
          location_trail_points: [
            {
              lat: 39.943436,
              lon: -76.993565,
              start_ts: '2020-05-05T00:00:00-04:00',
              end_ts: '2020-05-05T00:05:00-04:00',
            },
            {
              lat: 39.940623,
              lon: -76.992139,
              start_ts: '2020-05-05T00:05:00-04:00',
              end_ts: '2020-05-05T00:10:00-04:00',
            },
          ]
        })
        .expect(403)
        .end(done)
    })

    let createdCovidCaseId: number

    it('200s and adds a case on a POST /cases from a logged in staff member with permission', async () => {
      const response = await contactTracerAgent
        .post('/api/v1/cases')
        .send({
          patient_record_info: { some: 'metadata' },
          location_trail_points: [
            {
              lat: 39.943436,
              lon: -76.993565,
              start_ts: '2020-05-05T00:00:00-04:00',
              end_ts: '2020-05-05T00:05:00-04:00',
            },
            {
              lat: 39.940623,
              lon: -76.992139,
              start_ts: '2020-05-05T00:05:00-04:00',
              end_ts: '2020-05-05T00:10:00-04:00',
            },
          ]
        })
        .expect(200)

      createdCovidCaseId = response.body.id

      expect(createdCovidCaseId).to.be.a('number')

      const location_trail_points = await db('location_trail_points').select('*').where({ case_id: createdCovidCaseId })

      expect(location_trail_points).to.have.length(2)

      const { rows } = await db.raw(`
        select ST_Distance(
          (select location::geometry from location_trail_points where id = ${location_trail_points[0].id}),
          (select location::geometry from location_trail_points where id = ${location_trail_points[1].id})
        )
      `)

      expect(rows[0].st_distance).to.equal(0.0031537985033931537)
    })

    it('200s and returns the case and its location points in lat/lon format on a GET to /cases/$case_id', async () => {
      const response = await contactTracerAgent
        .get(`/api/v1/cases/${createdCovidCaseId}`)
        .expect(200)

      const covidCase = response.body
      expect(covidCase).to.have.all.keys('id', 'patient_record_info', 'infection_risk', 'created_by_staff_username', 'consent_to_make_public_received', 'consent_to_make_public_received_by_staff_username', 'consent_to_make_public_given_at', 'created_at', 'location_trail_points')
      expect(covidCase.id).to.equal(createdCovidCaseId)
      expect(covidCase.patient_record_info).to.eql({ some: 'metadata' })
      expect(covidCase.infection_risk).to.equal(1) // default
      expect(covidCase.created_by_staff_username).to.equal('contact_tracer_1')
      expect(covidCase.consent_to_make_public_received).to.equal(false)
      expect(covidCase.consent_to_make_public_received_by_staff_username).to.equal(null)
      expect(covidCase.consent_to_make_public_given_at).to.equal(null)
      expect(covidCase.location_trail_points).to.be.an('array').that.has.length(2)

      expect(covidCase.location_trail_points[0]).to.have.all.keys('id', 'lat', 'lon', 'start_ts', 'end_ts', 'redacted')
      expect(covidCase.location_trail_points[0].id).to.be.a('number')
      expect(covidCase.location_trail_points[0].lat).to.equal(39.943436)
      expect(covidCase.location_trail_points[0].lon).to.equal(-76.993565)
      expect(covidCase.location_trail_points[0].start_ts).to.equal('2020-05-05T00:00:00-04:00')
      expect(covidCase.location_trail_points[0].end_ts).to.equal('2020-05-05T00:05:00-04:00')

      expect(covidCase.location_trail_points[1]).to.have.all.keys('id', 'lat', 'lon', 'start_ts', 'end_ts', 'redacted')
      expect(covidCase.location_trail_points[1].id).to.be.a('number')
      expect(covidCase.location_trail_points[1].lat).to.equal(39.940623)
      expect(covidCase.location_trail_points[1].lon).to.equal(-76.992139)
      expect(covidCase.location_trail_points[1].start_ts).to.equal('2020-05-05T00:05:00-04:00')
      expect(covidCase.location_trail_points[1].end_ts).to.equal('2020-05-05T00:10:00-04:00')
    })

    let locationTrailPoints: ReadonlyArray<any>

    it('200s on POST to /cases/:case_id/location_trail_points with either a single point object or an array of point objects', async () => {
      await contactTracerAgent
        .post(`/api/v1/cases/${createdCovidCaseId}/location_trail_points`)
        .send({
          lat: 40,
          lon: -80,
          start_ts: '2020-05-05T00:10:00-04:00',
          end_ts: '2020-05-05T00:15:00-04:00',
        })
        .expect(200)

      await contactTracerAgent
        .post(`/api/v1/cases/${createdCovidCaseId}/location_trail_points`)
        .send([
          {
            lat: 72,
            lon: -62,
            start_ts: '2020-05-05T00:15:00-04:00',
            end_ts: '2020-05-05T00:20:00-04:00',
          },
          {
            lat: 74,
            lon: -62,
            start_ts: '2020-05-05T00:20:00-04:00',
            end_ts: '2020-05-05T00:25:00-04:00',
          }
        ])
        .expect(200)

      const response = await contactTracerAgent.get(`/api/v1/cases/${createdCovidCaseId}`)

      locationTrailPoints = response.body.location_trail_points
      expect(locationTrailPoints).to.have.length(5)
      locationTrailPoints.forEach((point: any) => {
        expect(point).to.have.all.keys('id', 'lat', 'lon', 'start_ts', 'end_ts', 'redacted')
        expect(point.id).to.be.a('number')
      })
    })

    it('200s on a POST to /cases/:case_id/location_trail_points/:location_trail_point_id/redact', async () => {
      await contactTracerAgent
        .post(`/api/v1/cases/${createdCovidCaseId}/location_trail_points/${locationTrailPoints[2].id}/redact`)
        .send({
          lat: 40,
          lon: -80,
          start_ts: '2020-05-05T00:10:00-04:00',
          end_ts: '2020-05-05T00:15:00-04:00',
        })
        .expect(200)
    })

    it('200s on a POST to /cases/:case_id/consent_to_make_public', async () => {
      await contactTracerAgent
        .post(`/api/v1/cases/${createdCovidCaseId}/consent_to_make_public`)
        .expect(200)
    })

    it('200s on a GET to /cases/:case_id showing the redacted point and consent information', async () => {
      const response = await contactTracerAgent.get(`/api/v1/cases/${createdCovidCaseId}`).expect(200)

      const covidCase = response.body
      expect(covidCase).to.have.all.keys('id', 'patient_record_info', 'infection_risk', 'created_by_staff_username', 'consent_to_make_public_received', 'consent_to_make_public_received_by_staff_username', 'consent_to_make_public_given_at', 'created_at', 'location_trail_points')
      expect(covidCase.consent_to_make_public_received).to.equal(true)
      expect(covidCase.consent_to_make_public_received_by_staff_username).to.equal('contact_tracer_1')
      expect(covidCase.consent_to_make_public_given_at).to.be.a('string').that.satisfies((s: string) => /^(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})\.(\d{3})Z$/)
    })

    it('200s and ends the session on a DELETE to /session', async () => {
      await contactTracerAgent.del(`/api/v1/session`)
      await contactTracerAgent.get(`/api/v1/cases/${createdCovidCaseId}`).expect(403)
    })
  })

  describe('admin', () => {
    it('200s when POST to /session has correct username and password', done => {
      adminAgent
        .post('/api/v1/session')
        .send({ username: 'admin', password: 'pw_admin' })
        .expect(200)
        .expect(res => {
          expect(res.header).to.have.property('set-cookie')
        })
        .end(done)
    })

    it('200s for a GET to /staff', async () => {
      const response = await adminAgent.get(`/api/v1/staff`).expect(200)
      const staff = response.body
      expect(staff).to.be.an('array').that.has.length(3)
      const admin = staff.find((p: any) => p.role === 'admin' && p.username === 'admin')
      const contact_tracer_1 = staff.find((p: any) => p.role === 'contact_tracer' && p.username === 'contact_tracer_1')
      const contact_tracer_2 = staff.find((p: any) => p.role === 'contact_tracer' && p.username === 'contact_tracer_2')

      expect(admin).to.be.an('object').that.has.all.keys('id', 'username', 'role', 'created_at', 'updated_at')
      expect(contact_tracer_1).to.be.an('object').that.has.all.keys('id', 'username', 'role', 'created_at', 'updated_at')
      expect(contact_tracer_2).to.be.an('object').that.has.all.keys('id', 'username', 'role', 'created_at', 'updated_at')
    })

    let createdContactTracerId: number

    it('200s for POST to /staff when all fields present', async () => {
      const response = await (
        adminAgent
          .post(`/api/v1/staff/contact_tracer`)
          .send({ username: 'new_user', password: 'okyesverynice' })
          .expect(200)
      )

      expect(response.body).to.have.all.keys('id', 'username', 'role')
      expect(response.body.id).to.be.a('number')
      expect(response.body.username).to.equal('new_user')
      expect(response.body.role).to.equal('contact_tracer')

      createdContactTracerId = response.body.id
    })

    // it('200s and allows a change of password', () => {

    // })

    it('404s for DELETE to /staff/:role/:staff_id when staff id is of a different role', async () => {
      await adminAgent
        .del(`/api/v1/staff/admin/${createdContactTracerId}`)
        .expect(404)

      const [staffMemberStillPresent] = await db('staff').select('*').where('id', createdContactTracerId)
      expect(staffMemberStillPresent).to.be.an('object')
    })

    it('200s for DELETE to /staff/:role/:staff_id when the staff member with that id has that role', async () => {
      await (
        adminAgent
          .del(`/api/v1/staff/contact_tracer/${createdContactTracerId}`)
          .expect(200)
      )

      const [staffMemberNoLongerPresent] = await db('staff').select('*').where('id', createdContactTracerId)
      expect(staffMemberNoLongerPresent).to.equal(undefined)
    })

    it('400s for POST to /staff/:role when role does not exist', done => {
      adminAgent
        .post(`/api/v1/staff/plumber`)
        .send({ username: 'new_user_nope', password: 'okyesverynice' })
        .expect(400, 'role (plumber) does not exist')
        .end(done)
    })

    // it('200s for a case deletion', () => {

    // })
  })
})
