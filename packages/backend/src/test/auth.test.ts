import { StatusCodes } from 'http-status-codes'

import { testServer } from './testSetup'
import * as createNonceLib from '../lib/nonce'
import * as creatJWTLib from '../lib/jwt'
import { sepolia } from '../chains/chains'
import { SESSION_EXPIRATION_TIME } from '../constants'
import authService from '../features/auth/authService'
import UnauthorizedError from '../errors/UnauthorizedError'
import { createTestSiweMessagePayload } from './utils'

describe('auth', () => {
  describe('getNonce endpoint', () => {
    it('should return 400 Bad Request when provided address is not a valid Ethereum address', async () => {
      const address = 'invalid_address'

      const createNonceMock = jest.spyOn(createNonceLib, 'createNonce')

      expect(createNonceMock).not.toHaveBeenCalled()

      const response = await testServer.server.inject({
        method: 'GET',
        url: `/auth/nonce/${address}`
      })

      const { error, details } = JSON.parse(response.payload)

      expect(createNonceMock).not.toHaveBeenCalled()

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)
      expect(error).toEqual('Invalid address')
      expect(details).toEqual({ address })
    })

    it('should return a valid nonce when provided a valid Ethereum address', async () => {
      const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'

      const testNonceMock = 'cpq1L6CWL38r4LGnx'
      const testJWTNonceMock =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImNwcTFMNkNXTDM4cjRMR254IiwiYWRkcmVzcyI6IjB4QjU1NzkxNkJmNGQzODQ1MjA0OGJBMGQ3Zjc4NGE3RjI0MjEyNjNjNiIsImp3dFR5cGUiOiJub25jZSIsImlhdCI6MTc0OTIyMDgxNiwiZXhwIjoxNzQ5MjIwOTM2fQ.kj1pv_dIf7j6qwID33Oq-4VXKw_vXyixf8QYD7AlbYM'

      const createNonceMock = jest.spyOn(createNonceLib, 'createNonce')
      const createJWTMock = jest.spyOn(creatJWTLib, 'createJWT')

      createNonceMock.mockReturnValueOnce(testNonceMock)
      expect(createNonceMock).not.toHaveBeenCalled()

      createJWTMock.mockReturnValueOnce(testJWTNonceMock)
      expect(createJWTMock).not.toHaveBeenCalled()

      const response = await testServer.server.inject({
        method: 'GET',
        url: `/auth/nonce/${address}`
      })

      const { address: returnedAddress, nonce, nonceSigned } = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(StatusCodes.OK)

      expect(createNonceMock).toHaveBeenCalled()
      expect(createJWTMock).toHaveBeenCalled()

      expect(address).toEqual(returnedAddress)
      expect(nonce).toEqual(testNonceMock)
      expect(nonceSigned).toEqual(testJWTNonceMock)

      createNonceMock.mockRestore()
      createJWTMock.mockRestore()
    })
  })

  describe('signIn endpoint', () => {
    it('should return a valid session coookie', async () => {
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

      const response = await testServer.server.inject({
        method: 'POST',
        url: '/auth/session',
        body: {
          siweMessageData,
          signature,
          nonceSigned
        }
      })

      expect(response.statusCode).toEqual(StatusCodes.OK)
      expect(JSON.parse(response.payload)).toEqual({})

      // Check cookie exists
      const cookies = response.headers['set-cookie']
      expect(cookies).toBeDefined()

      // Check that session-cookie is set
      const sessionCookie = Array.isArray(cookies)
        ? cookies.find((cookie) => cookie.startsWith('session-cookie='))
        : cookies

      // session cookie is secure
      expect(sessionCookie).toContain(mockedSessionToken)
      expect(sessionCookie).toContain('HttpOnly')
      expect(sessionCookie).toContain('Secure')
      expect(sessionCookie).toContain('SameSite=Lax')

      verifyNonceJWTMock.mockRestore()
      createJWTMock.mockRestore()
    })

    it('should return 401 Unauthorized when nonce is expired', async () => {
      const { siweMessageData, signature, nonceSigned } = createTestSiweMessagePayload()

      const response = await testServer.server.inject({
        method: 'POST',
        url: '/auth/session',
        body: {
          siweMessageData,
          signature,
          nonceSigned
        }
      })

      const { error, details } = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED)

      expect(error).toEqual('Invalid nonce')
      expect(details.reason).toEqual('Nonce Expired Error')
      expect(details.expiredAt).toEqual('2025-06-05T18:30:09.000Z')
      expect(details.nonceSigned).toEqual(nonceSigned)
    })

    it('should return 401 Unauthorized Error Request when a invalid signature is provided', async () => {
      const { siweMessageData, nonceSigned, fields } = createTestSiweMessagePayload()

      const { nonce, address } = fields

      const invalidSignature =
        '0x6f8c9f5b86dcb90d674ea2b843d43d99edb5790d5ad01516596f0c010a322ba626380c92f44b649c130cee27c56b62b95a8b9eefbde3196b9d2315be475e713b1c'

      // we need to bypass the nonce validation
      const validNoncePayload = { nonce, address, jwtType: 'nonce' }
      const verifyNonceJWTMock = jest.spyOn(creatJWTLib, 'verifyJWT')
      verifyNonceJWTMock.mockReturnValueOnce(validNoncePayload)

      const response = await testServer.server.inject({
        method: 'POST',
        url: '/auth/session',
        body: {
          siweMessageData,
          signature: invalidSignature,
          nonceSigned
        }
      })

      const { error, details } = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED)
      expect(error).toEqual('Invalid signature')
      expect(details.signature).toEqual(invalidSignature)

      verifyNonceJWTMock.mockRestore()
    })

    it('should return 401 Unauthorized when provided nonce was not generated by the server', async () => {
      const { siweMessageData } = createTestSiweMessagePayload()

      const invalidNonceSigned = 'jwt.token.not.generatedByTheServer'
      const signature = 'mockedSignature'

      // Mock verifyJWT to throw generic error (and not TokenExpiredError)
      const verifyNonceJWTMock = jest.spyOn(creatJWTLib, 'verifyJWT')
      verifyNonceJWTMock.mockImplementationOnce(() => {
        throw new Error('Invalid token signature')
      })

      const response = await testServer.server.inject({
        method: 'POST',
        url: '/auth/session',
        body: {
          siweMessageData,
          signature,
          nonceSigned: invalidNonceSigned
        }
      })

      const { error, details } = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED)
      expect(error).toEqual('Invalid nonce')
      expect(details).toEqual({ nonceSigned: invalidNonceSigned })

      verifyNonceJWTMock.mockRestore()
    })

    it('should return 401 Unauthorized when address in siweMessage does not match', async () => {
      const { fields } = createTestSiweMessagePayload()

      const { nonce } = fields

      const correctAddress = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'
      const wrongAddress = '0x1234567890123456789012345678901234567890'

      const nonceSigned = 'mockedNonceSignedJWT'
      const signature = 'mockedSignature'

      const siweMessageData = {
        ...fields,
        address: wrongAddress
      }

      const validNoncePayload = { nonce, address: correctAddress, jwtType: 'nonce' }
      const verifyNonceJWTMock = jest.spyOn(creatJWTLib, 'verifyJWT')
      verifyNonceJWTMock.mockReturnValueOnce(validNoncePayload)

      const response = await testServer.server.inject({
        method: 'POST',
        url: '/auth/session',
        body: {
          siweMessageData,
          signature,
          nonceSigned
        }
      })

      const { error, details } = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED)
      expect(error).toEqual('Invalid address')
      expect(details).toEqual({
        nonce,
        address: correctAddress,
        expectedAddress: wrongAddress
      })

      verifyNonceJWTMock.mockRestore()
    })

    it('should return 401 Unauthorized when provided nonce does not match', async () => {
      const { fields } = createTestSiweMessagePayload()

      const { address } = fields

      const correctNonce = 'CorrectNonce123'
      const wrongNonce = 'WrongNonce456'

      const nonceSigned = 'mockedNonceSignedJWT'
      const signature = 'mockedSignature'

      const siweMessageData = {
        ...fields,
        nonce: wrongNonce
      }

      const validNoncePayload = { nonce: correctNonce, address, jwtType: 'nonce' }
      const verifyNonceJWTMock = jest.spyOn(creatJWTLib, 'verifyJWT')
      verifyNonceJWTMock.mockReturnValueOnce(validNoncePayload)

      const response = await testServer.server.inject({
        method: 'POST',
        url: '/auth/session',
        body: {
          siweMessageData,
          signature,
          nonceSigned
        }
      })

      const { error, details } = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED)
      expect(error).toEqual('Invalid nonce')
      expect(details).toEqual({ nonce: correctNonce, address })

      verifyNonceJWTMock.mockRestore()
    })

    it('should return 400 Bad Request when no nonceSigned field is present', async () => {
      const { siweMessageData, signature } = createTestSiweMessagePayload()

      const response = await testServer.server.inject({
        method: 'POST',
        url: '/auth/session',
        body: {
          siweMessageData,
          signature
        }
      })

      const { error, details } = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)

      expect(error).toEqual('Missing nonceSigned')
      expect(details).toEqual({})
    })

    it('should return 400 Bad Request when no signature field is present', async () => {
      const { siweMessageData, nonceSigned } = createTestSiweMessagePayload()

      const response = await testServer.server.inject({
        method: 'POST',
        url: '/auth/session',
        body: {
          siweMessageData,
          nonceSigned
        }
      })

      const { error, details } = JSON.parse(response.payload)

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)

      expect(error).toEqual('Missing signature')
      expect(details).toEqual({})
    })

    describe('Siwe message validations', () => {
      it('should return 400 Bad Request when provided address in the Siwe message is not a valid Ethereum address', async () => {
        const { siweMessageData, signature, nonceSigned } = createTestSiweMessagePayload()

        const invalidAddress = 'Invalid_address'

        const response = await testServer.server.inject({
          method: 'POST',
          url: '/auth/session',
          body: {
            siweMessageData: {
              ...siweMessageData,
              address: invalidAddress
            },
            signature,
            nonceSigned
          }
        })

        const { error, details } = JSON.parse(response.payload)

        expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)

        expect(error).toEqual('Invalid address field in siwe message')
        expect(details).toEqual({})
      })

      it('should return 400 Bad Request when provided chainId in the Siwe message is not valid', async () => {
        const { siweMessageData, signature, nonceSigned } = createTestSiweMessagePayload()

        const invalidChainId = 'invalid chainId'

        const response = await testServer.server.inject({
          method: 'POST',
          url: '/auth/session',
          body: {
            siweMessageData: {
              ...siweMessageData,
              chainId: invalidChainId
            },
            signature,
            nonceSigned
          }
        })

        const { error, details } = JSON.parse(response.payload)

        expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)

        expect(error).toEqual('Invalid chainId field in siwe message')
        expect(details).toEqual({})
      })

      it('should return 400 Bad Request when no chainId is present in the Siwe message', async () => {
        const { siweMessageData, signature, nonceSigned } = createTestSiweMessagePayload()

        const response = await testServer.server.inject({
          method: 'POST',
          url: '/auth/session',
          body: {
            siweMessageData: {
              ...siweMessageData,
              chainId: undefined
            },
            signature,
            nonceSigned
          }
        })

        const { error, details } = JSON.parse(response.payload)

        expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)

        expect(error).toEqual('Missing chainId field in siwe message')
        expect(details).toEqual({})
      })

      it('should return 400 Bad Request when no domain is present in the Siwe message', async () => {
        const { siweMessageData, signature, nonceSigned } = createTestSiweMessagePayload()

        const response = await testServer.server.inject({
          method: 'POST',
          url: '/auth/session',
          body: {
            siweMessageData: {
              ...siweMessageData,
              domain: undefined
            },
            signature,
            nonceSigned
          }
        })

        const { error, details } = JSON.parse(response.payload)

        expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)

        expect(error).toEqual('Missing domain field in siwe message')
        expect(details).toEqual({})
      })

      it('should return 400 Bad Request when no nonce is present in the Siwe message', async () => {
        const { siweMessageData, signature, nonceSigned } = createTestSiweMessagePayload()

        const response = await testServer.server.inject({
          method: 'POST',
          url: '/auth/session',
          body: {
            siweMessageData: {
              ...siweMessageData,
              nonce: undefined
            },
            signature,
            nonceSigned
          }
        })

        const { error, details } = JSON.parse(response.payload)

        expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)

        expect(error).toEqual('Missing nonce field in siwe message')
        expect(details).toEqual({})
      })
    })
  })

  describe('verifySession', () => {
    it('should verify a valid session', async () => {
      const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'

      const jwtSessionPayload = {
        address,
        chainId: sepolia.chainId.toString(),
        jwtType: 'session'
      }
      const sessionToken = creatJWTLib.createJWT(jwtSessionPayload, SESSION_EXPIRATION_TIME)

      const sessionPayload = authService.verifySession(sessionToken)

      expect(sessionPayload.address).toEqual(address)
      expect(sessionPayload.chainId).toEqual(sepolia.chainId.toString())
      expect(sessionPayload.jwtType).toEqual('session')
    })

    it('should return an UnauthorizedError if it is an invalid session', async () => {
      const invalidSessionToken = 'invalid.session.token'

      expect(() => {
        authService.verifySession(invalidSessionToken)
      }).toThrow(UnauthorizedError)
    })
  })
})
