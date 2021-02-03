const buildServer = require('./build-server')

const plugin = require('../plugin.js');

test('MSSQL plugin is loaded', async () => {
  const app = buildServer()
  app.register(plugin)
  const response = await app.inject({
    method: 'GET',
    url: '/'
  })
  expect(app.mssql.pool).not.toBe(undefined);
  expect(response.statusCode).toBe(200);
  expect(JSON.parse(response.body)).toMatchObject({ hello: 'world' })
})
