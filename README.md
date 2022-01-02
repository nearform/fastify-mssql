# fastify-mssql

MSSQL Plugin for Fastify.

## Installation

```
npm install fastify-mssql
```

## Usage

### Example

```js
const Fastify = require('fastify')
const mssql = require('fastify-mssql')

const app = Fastify()

app.register(mssql, {
  server: 'my-host',
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

If you need to access the [SQL Data Types](https://github.com/tediousjs/node-mssql#data-types) you can access them by using the `mssql.sqlTypes` property:

```js
app.get('/users/:userId', async function (request) {
  try {
    const pool = await app.mssql.pool.connect()
    const query = 'SELECT * FROM users where id=@userID'
    const res = await pool
      .request()
      .input('userID', app.mssql.sqlTypes.Int, request.params.userId)
      .query(query)
    return { user: res.recordset }
  } catch (err) {
    return { error: err.message }
  }
})
```
