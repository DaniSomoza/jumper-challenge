import Server from './server/Server'
import routes from './routes/routes'
import { BACKEND_PORT, FRONTEND_ORIGINS, HOST } from './constants'

const service = new Server({ logger: true })

service.configureCors(FRONTEND_ORIGINS)
service.addRoutes(routes)

service.start(HOST, BACKEND_PORT)
