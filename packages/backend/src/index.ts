import Server from './server/Server'
import authRoutes from './routes/authRoutes'
import { BACKEND_PORT, FRONTEND_ORIGINS, HOST } from './constants'

const service = new Server({ logger: true })

service.configureCors(FRONTEND_ORIGINS)
service.addRoutes(authRoutes)

service.start(HOST, BACKEND_PORT)
