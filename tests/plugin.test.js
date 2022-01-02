const buildServer = require('./build-server')

const plugin = require('../plugin.js')

const { getPool } = require('./utils')

describe('fastify-mssql', () => {
  let app

  beforeAll(async () => {
    const pool = await getPool()
    app = buildServer()
    await pool.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = 'TestSuite')
        CREATE DATABASE TestSuite;
    `)
    await pool.query(`USE TestSuite`)
    await pool.query(
      'CREATE TABLE [dbo].[Users] ([id] bigint,[name] varchar(25), [email] varchar(25) PRIMARY KEY (id));'
    )
    await pool.query(
      "INSERT INTO [dbo].[Users] ([id], [name], [email]) VALUES ('1', N'Foobar', N'foobar@gmail.com');"
    )
    await pool.query(
      "INSERT INTO [dbo].[Users] ([id], [name], [email]) VALUES ('2', N'fizzbuzz', N'fizzbuzz@gmail.com');"
    )
  })

  afterAll(async () => {
    const pool = await getPool()
    await pool.query(`USE TestSuite`)
    await pool.query('DROP TABLE IF EXISTS [dbo].[Users]')
    await pool.close()
    app.close()
  })

  test('MSSQL plugin is loaded', async () => {
    app.register(plugin, {
      user: 'sa',
      password: 'S3cretP4ssw0rd!',
      database: 'TestSuite',
      options: {
        trustServerCertificate: true
      }
    })

    app.get('/users', async function () {
      try {
        await app.mssql.pool.connect()
        const res = await app.mssql.pool.query('SELECT * FROM [dbo].[Users];')
        return { users: res.recordset }
      } catch (err) {
        return { error: err.message }
      }
    })

    app.get('/users/:userId', async function (request) {
      try {
        const pool = await app.mssql.pool.connect()
        const query = 'SELECT * FROM [dbo].[Users] where id=@userID;'
        const res = await pool
          .request()
          .input('userID', app.mssql.sqlTypes.Int, request.params.userId)
          .query(query)
        return { user: res.recordset }
      } catch (err) {
        return { error: err.message }
      }
    })

    {
      const response = await app.inject({
        method: 'GET',
        url: '/users'
      })
      const body = JSON.parse(response.body)
      expect(app.mssql.pool).not.toBe(undefined)
      expect(response.statusCode).toBe(200)
      expect(body.users.length).toBe(2)
    }

    {
      const response = await app.inject({
        method: 'GET',
        url: '/users/2'
      })
      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({
        user: [{ id: '2', name: 'fizzbuzz', email: 'fizzbuzz@gmail.com' }]
      })
    }
  })
})
