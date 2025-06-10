import axios from 'axios'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

import routes from '../routes/routes'
import Server from '../server/Server'
import { ALCHEMY_RESPONSE_MOCK } from './mocks/alchemyMocks'
import { MORALIS_RESPONSE_MOCK } from './mocks/moralisMocks'
import PointsModel from '../database/models/PointsModel'

// initialize test database
let mongoTestDB = new MongoMemoryServer()

export async function connectToTestDatabase() {
  mongoTestDB = await MongoMemoryServer.create()
  const mongoUri = await mongoTestDB.getUri()
  await mongoose.connect(mongoUri)
}

export async function disconnectToTestDatabase() {
  await mongoose.disconnect()
  await mongoTestDB.stop()
}

export async function restoreTestDatabase() {
  await PointsModel.deleteMany({})
}

export const testServer = new Server({ logger: false })

testServer.addRoutes(routes)
testServer.configureCors(['http://localhost:3000'])

beforeEach(() => {
  jest.restoreAllMocks()

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

beforeAll(async () => {
  await connectToTestDatabase()
})

afterEach(async () => {
  jest.restoreAllMocks()
  await restoreTestDatabase()
})

afterAll(async () => {
  await disconnectToTestDatabase()
  await testServer.server.close()
})
