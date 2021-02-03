const fp = require('fastify-plugin');
const MSSql = require('mssql');

const defaults = {
  host: 'localhost',
  port: 1433,
  user: 'sa',
  password: '',
  database: ''
}

const plugin = async (fastify, options) => {
  const config = Object.assign({}, defaults, options)
  const { host, port, database, user, password } = config;
  const connectionString = `mssql://${user}:${password}@${host}:${port}/${database}`;
  const pool = await new MSSql.ConnectionPool(connectionString);

  fastify.addHook('onClose', async () => {
    await pool.close();
  });
  fastify.decorate('mssql', { pool })
};

module.exports = fp(plugin, {
  fastify: '>=3',
  name: 'fastify-mssql',
});