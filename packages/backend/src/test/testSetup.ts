import Server from '../server/Server'
import authRoutes from '../routes/authRoutes'

export const testServer = new Server({ logger: false })

testServer.addRoutes(authRoutes)
testServer.configureCors(['http://localhost:3000'])

afterAll(async () => {
  await testServer.server.close()
})
