const buildServer = require('./build-server')

const plugin = require('../plugin.js');
const MSSql = require('mssql');

const { getPool } = require('./utils')


let app;
beforeEach(async () => {
  const pool = await getPool();
  try {
    app = buildServer()
    await pool.query(`CREATE DATABASE TestSuite`);
    await pool.query(`USE TestSuite`);
    await pool.query("CREATE TABLE [dbo].[Users] ([id] bigint,[name] varchar(25), [email] varchar(25) PRIMARY KEY (id));");
    await pool.query("INSERT INTO [dbo].[Users] ([id], [name], [email]) VALUES ('1', N'Foobar', N'foobar@gmail.com');");
    await pool.query("INSERT INTO [dbo].[Users] ([id], [name], [email]) VALUES ('2', N'fizzbuzz', N'fizzbuzz@gmail.com');");
  } catch (err) {
    if (err.message.match(`Database 'TestSuite' already exists`)) {
      // do nothing, it's fine
    } else {
      throw err;
    }
  }


})
afterEach(async () => {
  const pool = await getPool();
  await pool.query(`USE TestSuite`);
  await pool.query("DROP TABLE [dbo].[Users]");
  await pool.close();
  app.close();
})

test('MSSQL plugin is loaded', async () => {

  app.register(plugin, {
    user: 'sa',
    password: 'S3cretP4ssw0rd!',
    database: 'TestSuite'
  })

  app.get('/users', async function (req, reply) {
    try {
      await app.mssql.pool.connect();
      const res = await app.mssql.pool.query('SELECT * FROM [dbo].[Users];');
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