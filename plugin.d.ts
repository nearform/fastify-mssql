import * as MSSql from 'mssql'

import { FastifyInstance, FastifyPluginAsync } from 'fastify';

export interface MSSQLPluginOptions extends MSSql.config {}

export interface MSSQLFastifyInterface {
  pool: MSSql.ConnectionPool,
}

declare module 'fastify' {
  interface FastifyInstance {
    mssql: MSSQLFastifyInterface
  }
}

declare const fastifyMssql: FastifyPluginAsync<MSSQLPluginOptions>

export default fastifyMssql
export { fastifyMssql }
