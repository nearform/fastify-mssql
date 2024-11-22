const { describe, before, after, test } = require('node:test')
const assert = require('node:assert')
const buildServer = require('./build-server')

const plugin = require('../plugin.js')

const { getPool } = require('./utils')

describe('fastify-mssql', () => {
  let app

  before(async () => {
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
  })

  after(async () => {
    const pool = await getPool()
    await pool.query(`USE TestSuite`)
    await pool.query('DROP TABLE IF EXISTS [dbo].[Users]')
    await pool.close()
    app.close()
  })

  describe('MSSQL plugin is loaded', () => {
    test('correctly return users', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users'
      })
      const body = JSON.parse(response.body)
      assert.ok(app.mssql.pool)
      assert.deepStrictEqual(response.statusCode, 200)
      assert.deepStrictEqual(body.users.length, 2)
    })

    test('correctly return user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/2'
      })
      assert.deepStrictEqual(response.statusCode, 200)
      assert.deepStrictEqual(response.json(), {
        user: [{ id: '2', name: 'fizzbuzz', email: 'fizzbuzz@gmail.com' }]
      })
    })
  })
})
