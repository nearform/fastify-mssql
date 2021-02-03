const buildServer = require('./build-server')

const plugin = require('../plugin.js');

let app;
beforeEach(() => {
  app = buildServer()
})
afterEach(() => {
  app.close();
})
test('MSSQL plugin is loaded', async () => {

  app.register(plugin, {
    user: 'sa',
    password: 'S3cretP4ssw0rd!',
    database: 'fastify'
  })

  app.get('/users', async function (req, reply) {
    try {
      await app.mssql.pool.connect();
      const res = await app.mssql.pool.query('SELECT * FROM users');
      return { users: res.recordset }
    } catch (err) {
      return { error: err.message }
    }
  })
  const response = await app.inject({
    method: 'GET',
    url: '/users'
  })

  const body = JSON.parse(response.body);

  expect(app.mssql.pool).not.toBe(undefined);
  expect(response.statusCode).toBe(200);
  expect(body.users.length).toBe(2);
})
