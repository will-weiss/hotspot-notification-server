
import { expect } from 'chai'
const request = require('supertest');
import server from '../server'



describe('the whole shebang', () => {
  let app: any
  
  before(() => app = server.listen(5004))
  after(() => app.close())

  it('works', (cb) => {
    request(app)
      .get('/v1/health_authority_info')
      .expect(200)
      .end(cb)
  })
})
