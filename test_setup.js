require('sinon-as-promised')

require('chai')
  .use(require('chai-http'))
  .use(require('sinon-chai'))

process.on('unhandledRejection', (reason) => { throw reason })
