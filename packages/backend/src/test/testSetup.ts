import routes from '../routes/routes'
import Server from '../server/Server'

export const testServer = new Server({ logger: false })

testServer.addRoutes(routes)
testServer.configureCors(['http://localhost:3000'])

afterAll(async () => {
  await testServer.server.close()
})
