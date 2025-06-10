import Server from './server/Server'
import routes from './routes/routes'
import { BACKEND_PORT, FRONTEND_ORIGINS, HOST } from './constants'
import connectToDatabase from './database/Database'

async function main() {
  await connectToDatabase()

  const service = new Server({ logger: true })

  service.configureCors(FRONTEND_ORIGINS)
  service.addRoutes(routes)

  service.start(HOST, BACKEND_PORT)
}

main()
