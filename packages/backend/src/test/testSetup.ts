import axios from 'axios'

import routes from '../routes/routes'
import Server from '../server/Server'
import { ALCHEMY_RESPONSE_MOCK } from './mocks/alchemyMocks'
import { MORALIS_RESPONSE_MOCK } from './mocks/moralisMocks'

export const testServer = new Server({ logger: false })

testServer.addRoutes(routes)
testServer.configureCors(['http://localhost:3000'])

beforeEach(() => {
  jest.restoreAllMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

afterAll(async () => {
  await testServer.server.close()
})

beforeAll(() => {
  jest.spyOn(axios, 'post').mockImplementation((url) => {
    if (url.includes('alchemy')) {
      return Promise.resolve({ data: ALCHEMY_RESPONSE_MOCK })
    }

    return Promise.reject(new Error('Unknown provider url'))
  })

  jest.spyOn(axios, 'get').mockImplementation((url) => {
    if (url.includes('moralis')) {
      return Promise.resolve({ data: MORALIS_RESPONSE_MOCK })
    }

    return Promise.reject(new Error('Unknown provider url'))
  })
})
