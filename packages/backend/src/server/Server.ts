import Fastify, { FastifyInstance, RouteOptions } from 'fastify'
import cors from '@fastify/cors'

class Server {
  server: FastifyInstance

  constructor(serverOptions: ServerOptions) {
    this.server = Fastify(serverOptions)
  }

  start(host: string, port: number) {
    this.server.listen({ host, port })
  }

  configureCors(origin: string[]) {
    this.server.register(cors, {
      origin,
      methods: ['GET', 'PUT', 'POST', 'DELETE']
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
