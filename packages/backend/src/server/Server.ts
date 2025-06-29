import Fastify, { FastifyInstance, RouteOptions } from 'fastify'
import fastifyCookie from '@fastify/cookie'
import cors from '@fastify/cors'

import { JWT_SECRET } from '../constants'

class Server {
  server: FastifyInstance

  constructor(serverOptions: ServerOptions) {
    this.server = Fastify(serverOptions)

    this.server.register(fastifyCookie, {
      secret: JWT_SECRET,
      parseOptions: {}
    })
  }

  start(host: string, port: number) {
    this.server.listen({ host, port })
  }

  configureCors(origin: string[]) {
    this.server.register(cors, {
      origin,
      methods: ['GET', 'PUT', 'POST', 'DELETE'],
      credentials: true
    })
  }

  addRoutes(routes: Route[]) {
    routes.map((route) => {
      this.server.route(route)
    })
  }
}

type ServerOptions = {
  logger: boolean
}

export type Route = RouteOptions

export default Server
