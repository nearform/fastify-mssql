'use strict';

const fp = require('fastify-plugin');
const MSSql = require('mssql');

const defaults = {
  server: 'localhost',
  port: 1433,
  user: 'sa',
  password: '',
  database: ''
}

const plugin = async (fastify, options) => {
  const config = Object.assign({}, defaults, options)
  const { server, port, database, user, password } = config;

  config.options = {
    'enableArithAbort': true
  }

  const pool = await new MSSql.ConnectionPool(config).connect();

  fastify.addHook('onClose', async () => {
    await pool.close();
  });
  fastify.decorate('mssql', { pool })
};

module.exports = fp(plugin, {
  fastify: '>=3',
  name: 'fastify-mssql',
});
