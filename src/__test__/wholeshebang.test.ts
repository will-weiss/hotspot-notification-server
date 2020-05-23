// tslint:disable:no-let
// tslint:disable:no-expression-statement

import { expect } from 'chai'
import * as request from 'supertest'
import * as permissions from '../permissions'
import db from '../db'
import server from '../server'
const { seed } = require('../../db/seeds/two_role_three_user')


describe('the whole shebang', () => {

  let app: any
  let adminAgent: request.SuperTest<request.Test>
  let contactTracerAgent: request.SuperTest<request.Test>
  let notLoggedInAgent: request.SuperTest<request.Test>

  before(() => seed(db))
  before(permissions.readPermissionsIntoMemory)
  before(() => app = server.listen(5004))
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
        .post('/v1/session')
        .send({ username: 'contact_tracer_1' })
        .expect(400)
        .end(done)
    })

    it('400s when POST to /session has no username', done => {
      contactTracerAgent
        .post('/v1/session')
        .send({ password: 'pw_contact_tracer_1' })
        .expect(400)
        .end(done)
    })

    it('401s when POST to /session has incorrect password', done => {
      contactTracerAgent
        .post('/v1/session')
        .send({ username: 'contact_tracer_1', password: 'whoops-pw_contact_tracer_1' })
        .expect(401)
        .end(done)
    })

    it('404s when POST to /session is nonexistent user', done => {
      contactTracerAgent
        .post('/v1/session')
        .send({ username: 'contact_tracer_77', password: 'pw_contact_tracer_1' })
        .expect(404)
        .end(done)
    })

    it('200s when POST to /session has correct username and password', done => {
      contactTracerAgent
        .post('/v1/session')
        .send({ username: 'contact_tracer_1', password: 'pw_contact_tracer_1' })
        .expect(200)
        .expect(res => {
          expect(res.header).to.have.property('set-cookie')
        })
        .end(done)
    })

    it('403s when a not logged in staff member attempts to POST to /cases', done => {
      notLoggedInAgent
        .post('/v1/cases')
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
        .post('/v1/cases')
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
      return contactTracerAgent
        .get(`/v1/cases/${createdCovidCaseId}`)
        .expect(200, {
          id: createdCovidCaseId,
          patient_record_info: { some: 'metadata' },
          infection_risk: 1,
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
    })

    it('200s and ends the session on a DELETE to /session', async () => {
      await contactTracerAgent.del(`/v1/session`)
      await contactTracerAgent.get(`/v1/cases/${createdCovidCaseId}`).expect(403)
    })
  })

  describe('admin', () => {
    it('200s when POST to /session has correct username and password', done => {
      adminAgent
        .post('/v1/session')
        .send({ username: 'admin', password: 'pw_admin' })
        .expect(200)
        .expect(res => {
          expect(res.header).to.have.property('set-cookie')
        })
        .end(done)
    })

    it('200s for a GET to /staff', async () => {
      const response = await adminAgent.get(`/v1/staff`).expect(200)
      const staff = response.body
      expect(staff).to.be.an('array').that.has.length(3)
      const admin = staff.find((p: any) => p.role === 'admin' && p.username === 'admin')
      const contact_tracer_1 = staff.find((p: any) => p.role === 'contact_tracer' && p.username === 'contact_tracer_1')
      const contact_tracer_2 = staff.find((p: any) => p.role === 'contact_tracer' && p.username === 'contact_tracer_2')

      expect(admin).to.be.an('object').that.has.all.keys('id', 'username', 'role', 'created_at', 'updated_at')
      expect(contact_tracer_1).to.be.an('object').that.has.all.keys('id', 'username', 'role', 'created_at', 'updated_at')
      expect(contact_tracer_2).to.be.an('object').that.has.all.keys('id', 'username', 'role', 'created_at', 'updated_at')
    })
  })
})
