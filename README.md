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
