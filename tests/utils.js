const MSSql = require('mssql');
let pool;

async function getPool() {
  if (!pool) {
    const config = {
      server: 'localhost',
      port: 1433,
      user: 'sa',
      //database: 'fastify',
      password: 'S3cretP4ssw0rd!',
      options: {
        'enableArithAbort': true
      }
    }
    pool = await new MSSql.ConnectionPool(config)
  }
  if (!pool.connected) {
    await pool.connect();
  }
  return pool;
}

module.exports = { getPool }