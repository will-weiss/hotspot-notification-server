import { first } from 'lodash'
import { expect } from 'chai'
import * as request from 'supertest'
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
  after(() => db.destroy())

  let admin_role_id: number
  let contact_tracer_role_id: number
  let contactTracerAgent: request.SuperTest<request.Test>

  it('sets up the database with seed data, incl. basic roles and a contact tracer', async () => {
    admin_role_id = first(await db('roles').insert({ role: 'admin' }).returning('id'))
    contact_tracer_role_id = first(await db('roles').insert({ role: 'contact_tracer' }).returning('id'))

    console.log(admin_role_id, typeof admin_role_id)

    // Admins can do it all
    await db('permissions').insert({ role_id: admin_role_id, method_pattern: '*', route_pattern: '*' })

    // Contact tracers can only generate auth codes and interact with cases
    await db('permissions').insert({ role_id: contact_tracer_role_id, method_pattern: 'POST', route_pattern: '/authcode/create' })
    await db('permissions').insert({ role_id: contact_tracer_role_id, method_pattern: 'POST', route_pattern: '/cases*' })

    await db('staff').insert({ username: 'contact_tracer_1', password: 'deadbeefdeadbeefdeadbeef', role_id: contact_tracer_role_id })
  })

  it('sets up a request.agent for the contact tracer', () => {
    contactTracerAgent = request.agent(app)
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
})
