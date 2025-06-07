import { isAddress } from 'ethers'

import authService from '../auth/authService'
import BadRequestError from '../../errors/BadRequestError'
import chains from '../../chains/chains'
import { getBalancesFromAlchemy } from './api-providers/alchemy'
import { getBalancesFromMorallis } from './api-providers/morallis'
import BadGatewayError from '../../errors/BadGatewayError'

async function getBalances(sessionToken?: string, customAddress?: string, customChainId?: string) {
  let address, chainId

  if (sessionToken) {
    const sessionPayload = authService.verifySession(sessionToken)

    address = sessionPayload.address
    chainId = sessionPayload.chainId
  } else {
    address = customAddress
    chainId = customChainId
  }

  if (!address) {
    throw new BadRequestError('Missing address')
  }

  if (!chainId) {
    throw new BadRequestError('Missing chainId')
  }

  const chain = chains.find((chain) => chain.chainId === Number(chainId))

  if (!chain) {
    throw new BadRequestError('Invalid chainId', { chainId })
  }

  if (!isAddress(address)) {
    throw new BadRequestError('Invalid address', { address })
  }

  try {
    // Alchemy API as a first option
    const balances = await getBalancesFromAlchemy(address, chain)

    return balances
  } catch {
    try {
      // Morallis API as a fallback
      const balances = await getBalancesFromMorallis(address, chain)

      return balances
    } catch {
      throw new BadGatewayError('all providers (alchemy and morallis) failed')
    }
  }
}

const erc20TokenBalancesService = {
  getBalances
}

export default erc20TokenBalancesService
