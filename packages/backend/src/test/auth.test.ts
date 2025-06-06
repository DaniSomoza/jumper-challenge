import { StatusCodes } from 'http-status-codes'

import { testServer } from './testSetup'
import * as createNonceLib from '../lib/nonce'
import * as creatJWTLib from '../lib/jwt'

describe('auth', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getNonce endpoint', () => {
    it('should return 400 Bad Request when provided address is not a valid Ethereum address', async () => {
      const address = 'invalid_address'

      const createNonceMock = jest.spyOn(createNonceLib, 'createNonce')

      expect(createNonceMock).not.toHaveBeenCalled()

      const response = await testServer.server.inject({
        method: 'GET',
        url: `/auth/nonce/${address}`
      })

      const { error, details } = JSON.parse(response.body)

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

      const { address: returnedAddress, nonce, nonceSigned } = JSON.parse(response.body)

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
    it('should return a valid session token', async () => {
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

      const { sessionToken } = JSON.parse(response.body)

      expect(response.statusCode).toEqual(StatusCodes.OK)
      expect(sessionToken).toEqual(mockedSessionToken)

      verifyNonceJWTMock.mockRestore()
      createJWTMock.mockRestore()
    })

    it('should return 401 Unauthorized Error Request when provided nonce is expired', async () => {
      const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'
      const chainId = 1
      const domain = 'localhost:3000'
      const issuedAt = '2025-06-05T18:28:09.694Z'
      const nonce = 'Qj80Vmv0reIIcIDok'
      const statement = 'Sign in to Jumper Code Challenge.'
      const uri = 'http://localhost:3000'
      const version = '1'

      const nonceSigned =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IlFqODBWbXYwcmVJSWNJRG9rIiwiYWRkcmVzcyI6IjB4QjU1NzkxNkJmNGQzODQ1MjA0OGJBMGQ3Zjc4NGE3RjI0MjEyNjNjNiIsImp3dFR5cGUiOiJub25jZSIsImlhdCI6MTc0OTE0ODA4OSwiZXhwIjoxNzQ5MTQ4MjA5fQ.RJIhXGrhVXLSS2z8yD-DO3jxtIp7r7xm7udN6EQacKY'
      const signature =
        '0x5edf6c59527a2f3e1a435ef1ff93ed965692351cf82e342fac7fb6a475f408e85a9288ea0d65bb18f18c885ae8854556c4f5595f8e646304511e0a8ba10301a31b'

      const siweMessageData = {
        address,
        chainId,
        domain,
        issuedAt,
        nonce,
        statement,
        uri,
        version
      }

      const response = await testServer.server.inject({
        method: 'POST',
        url: '/auth/session',
        body: {
          siweMessageData,
          signature,
          nonceSigned
        }
      })

      const { error, details } = JSON.parse(response.body)

      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED)

      expect(error).toEqual('Invalid nonce')
      expect(details.reason).toEqual('Nonce Expired Error')
      expect(details.expiredAt).toEqual('2025-06-05T18:30:09.000Z')
      expect(details.nonceSigned).toEqual(nonceSigned)
    })

    it('should return 401 Unauthorized Error Request when a invalid signature is provided', async () => {
      const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'
      const chainId = 1
      const domain = 'localhost:3000'
      const issuedAt = '2025-06-05T18:28:09.694Z'
      const nonce = 'Qj80Vmv0reIIcIDok'
      const statement = 'Sign in to Jumper Code Challenge.'
      const uri = 'http://localhost:3000'
      const version = '1'

      const nonceSigned =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IlFqODBWbXYwcmVJSWNJRG9rIiwiYWRkcmVzcyI6IjB4QjU1NzkxNkJmNGQzODQ1MjA0OGJBMGQ3Zjc4NGE3RjI0MjEyNjNjNiIsImp3dFR5cGUiOiJub25jZSIsImlhdCI6MTc0OTE0ODA4OSwiZXhwIjoxNzQ5MTQ4MjA5fQ.RJIhXGrhVXLSS2z8yD-DO3jxtIp7r7xm7udN6EQacKY'
      const invalidSignature =
        '0x6f8c9f5b86dcb90d674ea2b843d43d99edb5790d5ad01516596f0c010a322ba626380c92f44b649c130cee27c56b62b95a8b9eefbde3196b9d2315be475e713b1c'

      const siweMessageData = {
        address,
        chainId,
        domain,
        issuedAt,
        nonce,
        statement,
        uri,
        version
      }

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

      const { error, details } = JSON.parse(response.body)

      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED)
      expect(error).toEqual('Invalid signature')
      expect(details.signature).toEqual(invalidSignature)

      verifyNonceJWTMock.mockRestore()
    })

    it('should return 401 Unauthorized when provided nonce was not generated by the server', async () => {
      const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'
      const chainId = 1
      const domain = 'localhost:3000'
      const issuedAt = '2025-06-05T18:28:09.694Z'
      const nonce = 'Qj80Vmv0reIIcIDok'
      const statement = 'Sign in to Jumper Code Challenge.'
      const uri = 'http://localhost:3000'
      const version = '1'

      const invalidNonceSigned = 'jwt.token.not.generatedByTheServer'
      const signature = 'mockedSignature'

      const siweMessageData = {
        address,
        chainId,
        domain,
        issuedAt,
        nonce,
        statement,
        uri,
        version
      }

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

      const { error, details } = JSON.parse(response.body)

      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED)
      expect(error).toEqual('Invalid nonce')
      expect(details).toEqual({ nonceSigned: invalidNonceSigned })

      verifyNonceJWTMock.mockRestore()
    })

    it('should return 401 Unauthorized when address in siweMessage does not match', async () => {
      const correctAddress = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'
      const wrongAddress = '0x1234567890123456789012345678901234567890'
      const chainId = 1
      const domain = 'localhost:3000'
      const issuedAt = '2025-06-05T18:28:09.694Z'
      const nonce = 'Nonce123'
      const statement = 'Sign in to Jumper Code Challenge.'
      const uri = 'http://localhost:3000'
      const version = '1'

      const nonceSigned = 'mockedNonceSignedJWT'
      const signature = 'mockedSignature'

      const siweMessageData = {
        address: wrongAddress,
        chainId,
        domain,
        issuedAt,
        nonce,
        statement,
        uri,
        version
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

      const { error, details } = JSON.parse(response.body)

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
      const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'
      const chainId = 1
      const domain = 'localhost:3000'
      const issuedAt = '2025-06-05T18:28:09.694Z'
      const statement = 'Sign in to Jumper Code Challenge.'
      const uri = 'http://localhost:3000'
      const version = '1'
      const correctNonce = 'CorrectNonce123'
      const wrongNonce = 'WrongNonce456'

      const nonceSigned = 'mockedNonceSignedJWT'
      const signature = 'mockedSignature'

      const siweMessageData = {
        address,
        chainId,
        domain,
        issuedAt,
        nonce: wrongNonce,
        statement,
        uri,
        version
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

      const { error, details } = JSON.parse(response.body)

      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED)
      expect(error).toEqual('Invalid nonce')
      expect(details).toEqual({ nonce: correctNonce, address })

      verifyNonceJWTMock.mockRestore()
    })

    it('should return 400 Bad Request when no nonceSigned field is present', async () => {
      const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'
      const chainId = 1
      const domain = 'localhost:3000'
      const issuedAt = '2025-06-05T18:28:09.694Z'
      const nonce = 'Qj80Vmv0reIIcIDok'
      const statement = 'Sign in to Jumper Code Challenge.'
      const uri = 'http://localhost:3000'
      const version = '1'

      const signature =
        '0x5edf6c59527a2f3e1a435ef1ff93ed965692351cf82e342fac7fb6a475f408e85a9288ea0d65bb18f18c885ae8854556c4f5595f8e646304511e0a8ba10301a31b'

      const siweMessageData = {
        address,
        chainId,
        domain,
        issuedAt,
        nonce,
        statement,
        uri,
        version
      }

      const response = await testServer.server.inject({
        method: 'POST',
        url: '/auth/session',
        body: {
          siweMessageData,
          signature
        }
      })

      const { error, details } = JSON.parse(response.body)

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)

      expect(error).toEqual('Missing nonceSigned')
      expect(details).toEqual({})
    })

    it('should return 400 Bad Request when no signature field is present', async () => {
      const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'
      const chainId = 1
      const domain = 'localhost:3000'
      const issuedAt = '2025-06-05T18:28:09.694Z'
      const nonce = 'Qj80Vmv0reIIcIDok'
      const statement = 'Sign in to Jumper Code Challenge.'
      const uri = 'http://localhost:3000'
      const version = '1'

      const nonceSigned =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IlFqODBWbXYwcmVJSWNJRG9rIiwiYWRkcmVzcyI6IjB4QjU1NzkxNkJmNGQzODQ1MjA0OGJBMGQ3Zjc4NGE3RjI0MjEyNjNjNiIsImp3dFR5cGUiOiJub25jZSIsImlhdCI6MTc0OTE0ODA4OSwiZXhwIjoxNzQ5MTQ4MjA5fQ.RJIhXGrhVXLSS2z8yD-DO3jxtIp7r7xm7udN6EQacKY'

      const siweMessageData = {
        address,
        chainId,
        domain,
        issuedAt,
        nonce,
        statement,
        uri,
        version
      }

      const response = await testServer.server.inject({
        method: 'POST',
        url: '/auth/session',
        body: {
          siweMessageData,
          nonceSigned
        }
      })

      const { error, details } = JSON.parse(response.body)

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)

      expect(error).toEqual('Missing signature')
      expect(details).toEqual({})
    })

    describe('Siwe message validations', () => {
      it('should return 400 Bad Request when provided address in the Siwe message is not a valid Ethereum address', async () => {
        const address = 'Invalid_address'
        const chainId = 1
        const domain = 'localhost:3000'
        const issuedAt = '2025-06-05T18:28:09.694Z'
        const nonce = 'Qj80Vmv0reIIcIDok'
        const statement = 'Sign in to Jumper Code Challenge.'
        const uri = 'http://localhost:3000'
        const version = '1'

        const nonceSigned =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IlFqODBWbXYwcmVJSWNJRG9rIiwiYWRkcmVzcyI6IjB4QjU1NzkxNkJmNGQzODQ1MjA0OGJBMGQ3Zjc4NGE3RjI0MjEyNjNjNiIsImp3dFR5cGUiOiJub25jZSIsImlhdCI6MTc0OTE0ODA4OSwiZXhwIjoxNzQ5MTQ4MjA5fQ.RJIhXGrhVXLSS2z8yD-DO3jxtIp7r7xm7udN6EQacKY'
        const signature =
          '0x5edf6c59527a2f3e1a435ef1ff93ed965692351cf82e342fac7fb6a475f408e85a9288ea0d65bb18f18c885ae8854556c4f5595f8e646304511e0a8ba10301a31b'

        const siweMessageData = {
          address,
          chainId,
          domain,
          issuedAt,
          nonce,
          statement,
          uri,
          version
        }

        const response = await testServer.server.inject({
          method: 'POST',
          url: '/auth/session',
          body: {
            siweMessageData,
            signature,
            nonceSigned
          }
        })

        const { error, details } = JSON.parse(response.body)

        expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)

        expect(error).toEqual('Invalid address field in siwe message')
        expect(details).toEqual({})
      })

      it('should return 400 Bad Request when provided chainId in the Siwe message is not valid', async () => {
        const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'
        const chainId = 'invalid chainId'
        const domain = 'localhost:3000'
        const issuedAt = '2025-06-05T18:28:09.694Z'
        const nonce = 'Qj80Vmv0reIIcIDok'
        const statement = 'Sign in to Jumper Code Challenge.'
        const uri = 'http://localhost:3000'
        const version = '1'

        const nonceSigned =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IlFqODBWbXYwcmVJSWNJRG9rIiwiYWRkcmVzcyI6IjB4QjU1NzkxNkJmNGQzODQ1MjA0OGJBMGQ3Zjc4NGE3RjI0MjEyNjNjNiIsImp3dFR5cGUiOiJub25jZSIsImlhdCI6MTc0OTE0ODA4OSwiZXhwIjoxNzQ5MTQ4MjA5fQ.RJIhXGrhVXLSS2z8yD-DO3jxtIp7r7xm7udN6EQacKY'
        const signature =
          '0x5edf6c59527a2f3e1a435ef1ff93ed965692351cf82e342fac7fb6a475f408e85a9288ea0d65bb18f18c885ae8854556c4f5595f8e646304511e0a8ba10301a31b'

        const siweMessageData = {
          address,
          chainId,
          domain,
          issuedAt,
          nonce,
          statement,
          uri,
          version
        }

        const response = await testServer.server.inject({
          method: 'POST',
          url: '/auth/session',
          body: {
            siweMessageData,
            signature,
            nonceSigned
          }
        })

        const { error, details } = JSON.parse(response.body)

        expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)

        expect(error).toEqual('Invalid chainId field in siwe message')
        expect(details).toEqual({})
      })

      it('should return 400 Bad Request when no chainId is present in the Siwe message', async () => {
        const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'
        const domain = 'localhost:3000'
        const issuedAt = '2025-06-05T18:28:09.694Z'
        const nonce = 'Qj80Vmv0reIIcIDok'
        const statement = 'Sign in to Jumper Code Challenge.'
        const uri = 'http://localhost:3000'
        const version = '1'

        const nonceSigned =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IlFqODBWbXYwcmVJSWNJRG9rIiwiYWRkcmVzcyI6IjB4QjU1NzkxNkJmNGQzODQ1MjA0OGJBMGQ3Zjc4NGE3RjI0MjEyNjNjNiIsImp3dFR5cGUiOiJub25jZSIsImlhdCI6MTc0OTE0ODA4OSwiZXhwIjoxNzQ5MTQ4MjA5fQ.RJIhXGrhVXLSS2z8yD-DO3jxtIp7r7xm7udN6EQacKY'
        const signature =
          '0x5edf6c59527a2f3e1a435ef1ff93ed965692351cf82e342fac7fb6a475f408e85a9288ea0d65bb18f18c885ae8854556c4f5595f8e646304511e0a8ba10301a31b'

        const siweMessageData = {
          address,
          domain,
          issuedAt,
          nonce,
          statement,
          uri,
          version
        }

        const response = await testServer.server.inject({
          method: 'POST',
          url: '/auth/session',
          body: {
            siweMessageData,
            signature,
            nonceSigned
          }
        })

        const { error, details } = JSON.parse(response.body)

        expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)

        expect(error).toEqual('Missing chainId field in siwe message')
        expect(details).toEqual({})
      })

      it('should return 400 Bad Request when no domain is present in the Siwe message', async () => {
        const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'
        const chainId = 1
        const issuedAt = '2025-06-05T18:28:09.694Z'
        const nonce = 'Qj80Vmv0reIIcIDok'
        const statement = 'Sign in to Jumper Code Challenge.'
        const uri = 'http://localhost:3000'
        const version = '1'

        const nonceSigned =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IlFqODBWbXYwcmVJSWNJRG9rIiwiYWRkcmVzcyI6IjB4QjU1NzkxNkJmNGQzODQ1MjA0OGJBMGQ3Zjc4NGE3RjI0MjEyNjNjNiIsImp3dFR5cGUiOiJub25jZSIsImlhdCI6MTc0OTE0ODA4OSwiZXhwIjoxNzQ5MTQ4MjA5fQ.RJIhXGrhVXLSS2z8yD-DO3jxtIp7r7xm7udN6EQacKY'
        const signature =
          '0x5edf6c59527a2f3e1a435ef1ff93ed965692351cf82e342fac7fb6a475f408e85a9288ea0d65bb18f18c885ae8854556c4f5595f8e646304511e0a8ba10301a31b'

        const siweMessageData = {
          address,
          chainId,
          issuedAt,
          nonce,
          statement,
          uri,
          version
        }

        const response = await testServer.server.inject({
          method: 'POST',
          url: '/auth/session',
          body: {
            siweMessageData,
            signature,
            nonceSigned
          }
        })

        const { error, details } = JSON.parse(response.body)

        expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)

        expect(error).toEqual('Missing domain field in siwe message')
        expect(details).toEqual({})
      })

      it('should return 400 Bad Request when no nonce is present in the Siwe message', async () => {
        const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'
        const chainId = 1
        const domain = 'localhost:3000'
        const issuedAt = '2025-06-05T18:28:09.694Z'
        const statement = 'Sign in to Jumper Code Challenge.'
        const uri = 'http://localhost:3000'
        const version = '1'

        const nonceSigned =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IlFqODBWbXYwcmVJSWNJRG9rIiwiYWRkcmVzcyI6IjB4QjU1NzkxNkJmNGQzODQ1MjA0OGJBMGQ3Zjc4NGE3RjI0MjEyNjNjNiIsImp3dFR5cGUiOiJub25jZSIsImlhdCI6MTc0OTE0ODA4OSwiZXhwIjoxNzQ5MTQ4MjA5fQ.RJIhXGrhVXLSS2z8yD-DO3jxtIp7r7xm7udN6EQacKY'
        const signature =
          '0x5edf6c59527a2f3e1a435ef1ff93ed965692351cf82e342fac7fb6a475f408e85a9288ea0d65bb18f18c885ae8854556c4f5595f8e646304511e0a8ba10301a31b'

        const siweMessageData = {
          address,
          chainId,
          issuedAt,
          domain,
          statement,
          uri,
          version
        }

        const response = await testServer.server.inject({
          method: 'POST',
          url: '/auth/session',
          body: {
            siweMessageData,
            signature,
            nonceSigned
          }
        })

        const { error, details } = JSON.parse(response.body)

        expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)

        expect(error).toEqual('Missing nonce field in siwe message')
        expect(details).toEqual({})
      })
    })
  })
})

function createTestSiweMessagePayload() {
  const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'
  const chainId = 1
  const domain = 'localhost:3000'
  const issuedAt = '2025-06-05T18:28:09.694Z'
  const nonce = 'Qj80Vmv0reIIcIDok'
  const statement = 'Sign in to Jumper Code Challenge.'
  const uri = 'http://localhost:3000'
  const version = '1'

  const nonceSigned =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IlFqODBWbXYwcmVJSWNJRG9rIiwiYWRkcmVzcyI6IjB4QjU1NzkxNkJmNGQzODQ1MjA0OGJBMGQ3Zjc4NGE3RjI0MjEyNjNjNiIsImp3dFR5cGUiOiJub25jZSIsImlhdCI6MTc0OTE0ODA4OSwiZXhwIjoxNzQ5MTQ4MjA5fQ.RJIhXGrhVXLSS2z8yD-DO3jxtIp7r7xm7udN6EQacKY'
  const signature =
    '0x5edf6c59527a2f3e1a435ef1ff93ed965692351cf82e342fac7fb6a475f408e85a9288ea0d65bb18f18c885ae8854556c4f5595f8e646304511e0a8ba10301a31b'

  const siweMessageData = {
    address,
    chainId,
    domain,
    issuedAt,
    nonce,
    statement,
    uri,
    version
  }

  return {
    siweMessageData,
    nonceSigned,
    signature,
    fields: {
      address,
      chainId,
      domain,
      issuedAt,
      nonce,
      statement,
      uri,
      version
    }
  }
}
