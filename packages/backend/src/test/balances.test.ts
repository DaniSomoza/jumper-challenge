import { StatusCodes } from 'http-status-codes'

import { testServer } from './testSetup'
import { sepolia } from '../chains/chains'
import * as alchemyProvider from '../features/erc20-token-balances/api-providers/alchemy'
import * as moralisProvider from '../features/erc20-token-balances/api-providers/moralis'
import authService from '../features/auth/authService'
import { ERC20TokenBalance } from '../features/erc20-token-balances/BalancesTypes'

describe('balances', () => {
  describe('ERC20 balances endpoint', () => {
    it('should call Alchemy provider and return ERC20 balances', async () => {
      const address = '0x9E9FbDE7C7a83c43913BddC8779158F1368F0413'

      const spyGetBalancesFromAlchemy = jest.spyOn(alchemyProvider, 'getBalancesFromAlchemy')
      const spyGetBalancesFromMoralis = jest.spyOn(moralisProvider, 'getBalancesFromMoralis')

      expect(spyGetBalancesFromAlchemy).not.toHaveBeenCalled()
      expect(spyGetBalancesFromMoralis).not.toHaveBeenCalled()

      const response = await testServer.server.inject({
        method: 'GET',
        url: `/balances?address=${address}&chainId=${sepolia.chainId}`
      })

      // only alchemy was called
      expect(spyGetBalancesFromAlchemy).toHaveBeenCalledWith(address, sepolia)
      expect(spyGetBalancesFromMoralis).not.toHaveBeenCalled()

      expect(response.statusCode).toEqual(StatusCodes.OK)

      const body = JSON.parse(response.payload)

      expect(body.address).toEqual(address)
      expect(body.chainId).toEqual(sepolia.chainId)
      expect(body.provider.name).toEqual('Alchemy')

      const tokens = body.tokens as ERC20TokenBalance[]

      // all balances with correct format (string and decimal)
      expect(
        tokens.every(
          ({ balance }) =>
            typeof balance === 'string' && !balance.startsWith('0x') && BigInt(balance) >= 0
        )
      ).toBe(true)
    })

    it('should call Morallis provider and return ERC20 balances', async () => {
      const address = '0x9E9FbDE7C7a83c43913BddC8779158F1368F0413'

      const spyGetBalancesFromAlchemy = jest.spyOn(alchemyProvider, 'getBalancesFromAlchemy')
      const spyGetBalancesFromMoralis = jest.spyOn(moralisProvider, 'getBalancesFromMoralis')

      // Alchemy API failed
      spyGetBalancesFromAlchemy.mockRejectedValueOnce(new Error('Alchemy API failed'))

      expect(spyGetBalancesFromAlchemy).not.toHaveBeenCalled()
      expect(spyGetBalancesFromMoralis).not.toHaveBeenCalled()

      const response = await testServer.server.inject({
        method: 'GET',
        url: `/balances?address=${address}&chainId=${sepolia.chainId}`
      })

      // both providers were called
      expect(spyGetBalancesFromAlchemy).toHaveBeenCalledWith(address, sepolia)
      expect(spyGetBalancesFromMoralis).toHaveBeenCalledWith(address, sepolia)

      expect(response.statusCode).toEqual(StatusCodes.OK)

      const body = JSON.parse(response.payload)

      expect(body.address).toEqual(address)
      expect(body.chainId).toEqual(sepolia.chainId)
      expect(body.provider.name).toEqual('Moralis')

      const tokens = body.tokens as ERC20TokenBalance[]

      // all balances with correct format (string and decimal)
      expect(
        tokens.every(
          ({ balance }) =>
            typeof balance === 'string' && !balance.startsWith('0x') && BigInt(balance) >= 0
        )
      ).toBe(true)
    })

    it('should use the session token if present', async () => {
      const address = '0x9E9FbDE7C7a83c43913BddC8779158F1368F0413'

      const spyGetBalancesFromAlchemy = jest.spyOn(alchemyProvider, 'getBalancesFromAlchemy')
      const spyGetBalancesFromMoralis = jest.spyOn(moralisProvider, 'getBalancesFromMoralis')

      expect(spyGetBalancesFromAlchemy).not.toHaveBeenCalled()
      expect(spyGetBalancesFromMoralis).not.toHaveBeenCalled()

      // Mock verifySession
      jest.spyOn(authService, 'verifySession').mockReturnValueOnce({
        address,
        chainId: sepolia.chainId.toString(),
        jwtType: 'session'
      })

      const signedCookie = testServer.server.signCookie('validSessionToken')

      const response = await testServer.server.inject({
        method: 'GET',
        url: '/balances',
        headers: {
          cookie: `session-cookie=${signedCookie}`
        }
      })

      expect(response.statusCode).toEqual(StatusCodes.OK)

      // only alchemy was called
      expect(spyGetBalancesFromAlchemy).toHaveBeenCalledWith(address, sepolia)
      expect(spyGetBalancesFromMoralis).not.toHaveBeenCalled()

      const body = JSON.parse(response.payload)

      expect(body.address).toEqual(address)
      expect(body.chainId).toEqual(sepolia.chainId)
      expect(body.provider.name).toEqual('Alchemy')

      const tokens = body.tokens as ERC20TokenBalance[]

      // all balances with correct format (string and decimal)
      expect(
        tokens.every(
          ({ balance }) =>
            typeof balance === 'string' && !balance.startsWith('0x') && BigInt(balance) >= 0
        )
      ).toBe(true)
    })

    it('should return a Bad Gateway error if all providers fail', async () => {
      const address = '0x9E9FbDE7C7a83c43913BddC8779158F1368F0413'

      const spyGetBalancesFromAlchemy = jest.spyOn(alchemyProvider, 'getBalancesFromAlchemy')
      const spyGetBalancesFromMoralis = jest.spyOn(moralisProvider, 'getBalancesFromMoralis')

      // Alchemy API failed
      spyGetBalancesFromAlchemy.mockRejectedValueOnce(new Error('Alchemy API failed'))

      // Moralis API failed
      spyGetBalancesFromMoralis.mockRejectedValueOnce(new Error('Moralis API failed'))

      expect(spyGetBalancesFromAlchemy).not.toHaveBeenCalled()
      expect(spyGetBalancesFromMoralis).not.toHaveBeenCalled()

      const response = await testServer.server.inject({
        method: 'GET',
        url: `/balances?address=${address}&chainId=${sepolia.chainId}`
      })

      // both providers were called
      expect(spyGetBalancesFromAlchemy).toHaveBeenCalledWith(address, sepolia)
      expect(spyGetBalancesFromMoralis).toHaveBeenCalledWith(address, sepolia)

      expect(response.statusCode).toEqual(StatusCodes.BAD_GATEWAY)

      const { error } = JSON.parse(response.payload)

      expect(error).toEqual('all providers (alchemy and moralis) failed')
    })

    it('should return Unauthorized error if the session is invalid', async () => {
      const spyGetBalancesFromAlchemy = jest.spyOn(alchemyProvider, 'getBalancesFromAlchemy')
      const spyGetBalancesFromMoralis = jest.spyOn(moralisProvider, 'getBalancesFromMoralis')

      expect(spyGetBalancesFromAlchemy).not.toHaveBeenCalled()
      expect(spyGetBalancesFromMoralis).not.toHaveBeenCalled()

      const signedCookie = testServer.server.signCookie('invalidSessionToken')

      const response = await testServer.server.inject({
        method: 'GET',
        url: '/balances',
        headers: {
          cookie: `session-cookie=${signedCookie}`
        }
      })

      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED)

      // no provider called
      expect(spyGetBalancesFromAlchemy).not.toHaveBeenCalled()
      expect(spyGetBalancesFromMoralis).not.toHaveBeenCalled()

      const { error, details } = JSON.parse(response.payload)

      expect(error).toEqual('Invalid session')
      expect(details.sessionToken).toEqual('invalidSessionToken')
    })

    it('should return 400 if the address is invalid', async () => {
      const address = 'invalid_address'

      const spyGetBalancesFromAlchemy = jest.spyOn(alchemyProvider, 'getBalancesFromAlchemy')
      const spyGetBalancesFromMoralis = jest.spyOn(moralisProvider, 'getBalancesFromMoralis')

      expect(spyGetBalancesFromAlchemy).not.toHaveBeenCalled()
      expect(spyGetBalancesFromMoralis).not.toHaveBeenCalled()

      const response = await testServer.server.inject({
        method: 'GET',
        url: `/balances?address=${address}&chainId=${sepolia.chainId}`
      })

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)

      // no provider called
      expect(spyGetBalancesFromAlchemy).not.toHaveBeenCalled()
      expect(spyGetBalancesFromMoralis).not.toHaveBeenCalled()

      const { error, details } = JSON.parse(response.payload)

      expect(error).toEqual('Invalid address')
      expect(details.address).toEqual(address)
    })

    it('should return 400 if the address is missing', async () => {
      const spyGetBalancesFromAlchemy = jest.spyOn(alchemyProvider, 'getBalancesFromAlchemy')
      const spyGetBalancesFromMoralis = jest.spyOn(moralisProvider, 'getBalancesFromMoralis')

      expect(spyGetBalancesFromAlchemy).not.toHaveBeenCalled()
      expect(spyGetBalancesFromMoralis).not.toHaveBeenCalled()

      const response = await testServer.server.inject({
        method: 'GET',
        url: `/balances?chainId=${sepolia.chainId}`
      })

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)

      // no provider called
      expect(spyGetBalancesFromAlchemy).not.toHaveBeenCalled()
      expect(spyGetBalancesFromMoralis).not.toHaveBeenCalled()

      const { error } = JSON.parse(response.payload)

      expect(error).toEqual('Missing address')
    })

    it('should return 400 if the chain is invalid', async () => {
      const address = '0x9E9FbDE7C7a83c43913BddC8779158F1368F0413'
      const chainId = 'invalid_chain_id'

      const spyGetBalancesFromAlchemy = jest.spyOn(alchemyProvider, 'getBalancesFromAlchemy')
      const spyGetBalancesFromMoralis = jest.spyOn(moralisProvider, 'getBalancesFromMoralis')

      expect(spyGetBalancesFromAlchemy).not.toHaveBeenCalled()
      expect(spyGetBalancesFromMoralis).not.toHaveBeenCalled()

      const response = await testServer.server.inject({
        method: 'GET',
        url: `/balances?address=${address}&chainId=${chainId}`
      })

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)

      // no provider called
      expect(spyGetBalancesFromAlchemy).not.toHaveBeenCalled()
      expect(spyGetBalancesFromMoralis).not.toHaveBeenCalled()

      const { error, details } = JSON.parse(response.payload)

      expect(error).toEqual('Invalid chainId')
      expect(details.chainId).toEqual(chainId)
    })

    it('should return 400 if the chain is missing', async () => {
      const address = '0x9E9FbDE7C7a83c43913BddC8779158F1368F0413'

      const spyGetBalancesFromAlchemy = jest.spyOn(alchemyProvider, 'getBalancesFromAlchemy')
      const spyGetBalancesFromMoralis = jest.spyOn(moralisProvider, 'getBalancesFromMoralis')

      expect(spyGetBalancesFromAlchemy).not.toHaveBeenCalled()
      expect(spyGetBalancesFromMoralis).not.toHaveBeenCalled()

      const response = await testServer.server.inject({
        method: 'GET',
        url: `/balances?address=${address}`
      })

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)

      // no provider called
      expect(spyGetBalancesFromAlchemy).not.toHaveBeenCalled()
      expect(spyGetBalancesFromMoralis).not.toHaveBeenCalled()

      const { error } = JSON.parse(response.payload)

      expect(error).toEqual('Missing chainId')
    })
  })

  describe('providers', () => {
    describe('Alchemy', () => {
      it('should correctly parse and filter tokens from Alchemy response', async () => {
        const address = '0x9E9FbDE7C7a83c43913BddC8779158F1368F0413'

        const balances = await alchemyProvider.getBalancesFromAlchemy(address, sepolia)

        // basic Balances schema
        expect(balances.address).toEqual(address)
        expect(balances.chainId).toEqual(sepolia.chainId)
        expect(balances.provider.name).toEqual('Alchemy')

        // all tokens are ERC20 tokens (native token removed)
        expect(balances.tokens.every(({ address }) => !!address)).toBe(true)

        // ERC20 tokens with balance 0 removed
        expect(balances.tokens.some(({ balance }) => balance === '0')).toBe(false)

        // all balances with correct format (string and decimal)
        expect(
          balances.tokens.every(
            ({ balance }) =>
              typeof balance === 'string' && !balance.startsWith('0x') && BigInt(balance) >= 0
          )
        ).toBe(true)
      })
    })

    describe('Moralis', () => {
      it('should correctly parse and filter tokens from Moralis response', async () => {
        const address = '0x9E9FbDE7C7a83c43913BddC8779158F1368F0413'

        const balances = await moralisProvider.getBalancesFromMoralis(address, sepolia)

        // basic Balances schema
        expect(balances.address).toEqual(address)
        expect(balances.chainId).toEqual(sepolia.chainId)
        expect(balances.provider.name).toEqual('Moralis')

        // all tokens are ERC20 tokens (native token removed)
        expect(balances.tokens.every(({ address }) => !!address)).toBe(true)

        // ERC20 tokens with balance 0 removed
        expect(balances.tokens.some(({ balance }) => balance === '0')).toBe(false)

        // all balances with correct format (string and decimal)
        expect(
          balances.tokens.every(
            ({ balance }) =>
              typeof balance === 'string' && !balance.startsWith('0x') && BigInt(balance) >= 0
          )
        ).toBe(true)
      })
    })
  })
})
