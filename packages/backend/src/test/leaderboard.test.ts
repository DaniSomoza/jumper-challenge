import { testServer } from './testSetup'
import * as creatJWTLib from '../lib/jwt'
import { createTestSiweMessagePayload } from './utils'
import leaderboardRepository from '../features/leaderboard/leaderboardRepository'
import { gnosis, mainnet, sepolia } from '../chains/chains'
import { StatusCodes } from 'http-status-codes'
import leaderboardService from '../features/leaderboard/leaderBoardService'

describe('leaderboard', () => {
  describe('update leaderboard on signIn', () => {
    it('should update the leaderboard when user logs in', async () => {
      const { siweMessageData, signature, nonceSigned, fields } = createTestSiweMessagePayload()

      const { nonce, address } = fields

      // we need to bypass the nonce validation
      const validNoncePayload = { nonce, address, jwtType: 'nonce' }
      const verifyNonceJWTMock = jest.spyOn(creatJWTLib, 'verifyJWT')
      verifyNonceJWTMock.mockReturnValueOnce(validNoncePayload)

      // we need to bypass the sessionToken creation
      const mockedSessionToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiMHhCNTU3OTE2QmY0ZDM4NDUyMDQ4YkEwZDdmNzg0YTdGMjQyMTI2M2M2Iiwiand0VHlwZSI6InNlc3Npb24iLCJpYXQiOjE3NDkxNDgwOTgsImV4cCI6MTc0OTQwNzI5OH0.42GAYHLtmiVsasvwGSOTdkgHauJSzliO-piEdifXLgw'
      const createJWTMock = jest.spyOn(creatJWTLib, 'createJWT')
      createJWTMock.mockReturnValueOnce(mockedSessionToken)

      // mainnet
      expect(siweMessageData.chainId).toEqual(mainnet.chainId)

      // leaderboard empty
      expect(await leaderboardRepository.getLeaderboard()).toEqual([])

      // signIn
      await testServer.server.inject({
        method: 'POST',
        url: '/auth/session',
        body: {
          siweMessageData,
          signature,
          nonceSigned
        }
      })

      // leaderboard with 3 points
      expect(await leaderboardRepository.getLeaderboard()).toEqual([
        {
          address,
          totalPoints: 3 // 3 points
        }
      ])
    })
  })

  describe('getLeaderboard endpoint', () => {
    it('should return the leaderboard updated with mainnet points', async () => {
      const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'

      expect(await leaderboardRepository.getLeaderboard()).toEqual([])

      const response = await testServer.server.inject({
        method: 'GET',
        url: '/leaderboard'
      })

      // leaderboard empty
      expect(response.statusCode).toEqual(StatusCodes.OK)
      expect(JSON.parse(response.payload)).toEqual([])

      // leaderboard with 3 points (from mainnet)
      await leaderboardService.savePoints(address, mainnet.chainId)

      const responseUpdated = await testServer.server.inject({
        method: 'GET',
        url: '/leaderboard'
      })

      // leaderboard with 3 points
      expect(responseUpdated.statusCode).toEqual(StatusCodes.OK)
      expect(JSON.parse(responseUpdated.payload)).toEqual([
        {
          address,
          totalPoints: 3
        }
      ])
    })

    it('should return the leaderboard updated with L2 points', async () => {
      const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'

      expect(await leaderboardRepository.getLeaderboard()).toEqual([])

      const response = await testServer.server.inject({
        method: 'GET',
        url: '/leaderboard'
      })

      // leaderboard empty
      expect(response.statusCode).toEqual(StatusCodes.OK)
      expect(JSON.parse(response.payload)).toEqual([])

      // leaderboard with 2 points (from L2)
      await leaderboardService.savePoints(address, gnosis.chainId)

      const responseUpdated = await testServer.server.inject({
        method: 'GET',
        url: '/leaderboard'
      })

      // leaderboard with 2 points
      expect(responseUpdated.statusCode).toEqual(StatusCodes.OK)
      expect(JSON.parse(responseUpdated.payload)).toEqual([
        {
          address,
          totalPoints: 2
        }
      ])
    })

    it('should return the leaderboard updated with testnet points', async () => {
      const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'

      expect(await leaderboardRepository.getLeaderboard()).toEqual([])

      const response = await testServer.server.inject({
        method: 'GET',
        url: '/leaderboard'
      })

      // leaderboard empty
      expect(response.statusCode).toEqual(StatusCodes.OK)
      expect(JSON.parse(response.payload)).toEqual([])

      // leaderboard with 1 points (from sepolia)
      await leaderboardService.savePoints(address, sepolia.chainId)

      const responseUpdated = await testServer.server.inject({
        method: 'GET',
        url: '/leaderboard'
      })

      // leaderboard with 1 point
      expect(responseUpdated.statusCode).toEqual(StatusCodes.OK)
      expect(JSON.parse(responseUpdated.payload)).toEqual([
        {
          address,
          totalPoints: 1
        }
      ])
    })
  })
})
