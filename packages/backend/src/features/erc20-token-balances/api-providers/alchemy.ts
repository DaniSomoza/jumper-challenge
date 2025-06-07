import axios from 'axios'

import { BalanceProvider, Balances, ERC20TokenBalance } from '../BalancesTypes'
import { Chain } from '../../../chains/chains'
import { alchemyApiKey } from '../../../constants'

type AlchemyBalances = {
  data: {
    tokens: {
      address: string
      network: string
      tokenAddress: string | null // null if native token
      tokenBalance: string
      tokenMetadata: {
        decimals: number | null
        logo: string | null
        name: string | null
        symbol: string | null
      }
      tokenPrices: {
        currency: string
        value: string
        lastUpdatedAt: string
      }[]
    }[]
    pageKey: string | null
  }
}

const alchemyProvider: BalanceProvider = {
  name: 'Alchemy',
  logo: 'https://www.datocms-assets.com/105223/1699253173-alchemy-logo.svg?auto=format&h=32&w=32',
  decription:
    'Alchemy is the platform layer needed to empower developers to build great applications that tap into the blockchain revolution.'
}

export async function getBalancesFromAlchemy(address: string, chain: Chain): Promise<Balances> {
  const url = `https://api.g.alchemy.com/data/v1/${alchemyApiKey}/assets/tokens/by-address`

  const headers = {
    'Content-Type': 'application/json'
  }

  const body = {
    addresses: [
      {
        address: address,
        networks: [chain.network]
      }
    ]
  }

  const response = await axios.post(url, body, { headers })

  const alchemyBalances = response.data as AlchemyBalances

  const tokens: ERC20TokenBalance[] = alchemyBalances.data.tokens
    .map((tokenBalance) => ({
      address: tokenBalance.tokenAddress || '',
      balance: BigInt(tokenBalance.tokenBalance).toString(10), // balances as decimal string
      name: tokenBalance.tokenMetadata.name || '',
      logo: tokenBalance.tokenMetadata.logo || '',
      symbol: tokenBalance.tokenMetadata.symbol || '',
      decimals: tokenBalance.tokenMetadata.decimals || 0,
      isSpamToken: false
    }))
    .filter(({ address, balance }) => !!address && balance !== '0') // remove native token and 0 balances

  return {
    address,
    chainId: chain.chainId,
    tokens,
    provider: alchemyProvider
  }
}
