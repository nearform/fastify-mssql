# MSSQL Plugin for Fastify

This plugin exposes the `MSSQL.ConnectionPool` to the fastify instance

## Usage

```
const Fastify = require('fastify')

const app = Fastify({
  logger: true
})

const mssqlPlugin = require('fastify-mssql')
app.register(mssqlPlugin, {
  host: 'my-host',
  port: 1433,
  user: 'my-user',
  password: 'my-password',
  database: 'my-database'
})

app.get('/users', async function (req, reply) {
  try {
    await app.mssql.pool.connect();
    const res = await app.mssql.pool.query('SELECT * FROM users');
    return { users: res.recordset }
  } catch (err) {
    return err;
  }
})

app.listen(3000)
```