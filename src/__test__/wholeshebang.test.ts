import { first } from 'lodash'
import * as moment from 'moment'
import { expect } from 'chai'
import * as request from 'supertest'
import * as passwords from '../passwords'
import db from '../db'
import server from '../server'

const dropAll = () =>
  db.raw(`
    delete from location_trail_points;
    delete from cases;
    delete from permissions;
    delete from staff;
    delete from roles;
    delete from health_authority_info_field;
  `)


describe('the whole shebang', () => {
  let app: any

  before(dropAll)
  before(() => app = server.listen(5004))
  after(() => app.close())
  after(() => db.destroy()) // Leave the database contents alone in case these are useful to inspect after tests have run

  let admin_role_id: number
  let contact_tracer_role_id: number
  let contactTracerAgent: request.SuperTest<request.Test>
  let notLoggedInAgent: request.SuperTest<request.Test>

  it('sets up the database with seed data, incl. basic roles and a contact tracer', async () => {
    admin_role_id = first(await db('roles').insert({ role: 'admin' }).returning('id'))
    contact_tracer_role_id = first(await db('roles').insert({ role: 'contact_tracer' }).returning('id'))

    // Admins can do it all
    await db('permissions').insert({ role_id: admin_role_id, method_pattern: '*', route_pattern: '*' })

    // Contact tracers can only generate auth codes and interact with cases
    await db('permissions').insert({ role_id: contact_tracer_role_id, method_pattern: 'POST', route_pattern: '/authcode/create' })
    await db('permissions').insert({ role_id: contact_tracer_role_id, method_pattern: 'POST', route_pattern: '/cases*' })

    // Add a contact tracer with an encrypted password
    await db('staff').insert({ 
      username: 'contact_tracer_1',
      hashed_password: await passwords.encrypt('deadbeefdeadbeefdeadbeef'),
      role_id: contact_tracer_role_id 
    })
  })

  it('sets up a request.agent for the contact tracer and a not logged in user', () => {
    contactTracerAgent = request.agent(app)
    notLoggedInAgent = request.agent(app)
  })

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
      .send({ password: 'deadbeefdeadbeefdeadbeef' })
      .expect(400)
      .end(done)
  })

  it('401s when POST to /session has incorrect password', done => {
    contactTracerAgent
      .post('/v1/session')
      .send({ username: 'contact_tracer_1', password: 'whoops-deadbeefdeadbeefdeadbeef' })
      .expect(401)
      .end(done)
  })

  it('404s when POST to /session is nonexistent user', done => {
    contactTracerAgent
      .post('/v1/session')
      .send({ username: 'contact_tracer_77', password: 'deadbeefdeadbeefdeadbeef' })
      .expect(404)
      .end(done)
  })

  it('200s when POST to /session has correct username and password', done => {
    contactTracerAgent
      .post('/v1/session')
      .send({ username: 'contact_tracer', password: 'deadbeefdeadbeefdeadbeef' })
      .expect(404)
      .end(done)
  })

  it('403s when a not logged in staff member attempts to POST to /cases', done => {
    notLoggedInAgent
      .post('/cases')
      .send({ 
        patient_record_info: { some: 'metadata' },
        location_trail_points: [
          {
            lat: 39.943436,
            lon: -76.993565,
            start_ts: moment('2020-05-05T00:00:00').format('x'),
            end_ts: moment('2020-05-05T00:05:00').format('x'),
          },
          {
            lat: 39.940623,
            lon: -76.992139,
            start_ts: moment('2020-05-05T00:05:00').format('x'),
            end_ts: moment('2020-05-05T00:10:00').format('x'),
          },
        ]
      })
      .expect(403)
      .end(done)
  })

  it('200s and adds a case on a POST /cases from a logged in staff member with permission', async () => {
    const response = await notLoggedInAgent
      .post('/cases')
      .send({ 
        patient_record_info: { some: 'metadata' },
        location_trail_points: [
          {
            lat: 39.943436,
            lon: -76.993565,
            start_ts: moment('2020-05-05T00:00:00').format('x'),
            end_ts: moment('2020-05-05T00:05:00').format('x'),
          },
          {
            lat: 39.940623,
            lon: -76.992139,
            start_ts: moment('2020-05-05T00:05:00').format('x'),
            end_ts: moment('2020-05-05T00:10:00').format('x'),
          },
        ]
      })
      .expect(200)

    console.log(response.body)
  })
})
