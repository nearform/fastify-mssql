'use strict'

const fp = require('fastify-plugin')
const MSSql = require('mssql')

const defaults = {
  server: 'localhost',
  port: 1433,
  user: 'sa',
  password: '',
  database: ''
}
const defaultOptions = {
  enableArithAbort: true
}

const plugin = async (fastify, config) => {
  const connectionConfig = Object.assign({}, defaults, config)
  connectionConfig.options = Object.assign({}, defaultOptions, config.options)

  const pool = await new MSSql.ConnectionPool(connectionConfig)

  fastify.addHook('onClose', async () => {
    await pool.close()
  })
  fastify.decorate('mssql', { pool })
  fastify.decorate('sqlTypes', MSSql)
}

module.exports = fp(plugin, {
  fastify: '>=3',
  name: 'fastify-mssql'
})
