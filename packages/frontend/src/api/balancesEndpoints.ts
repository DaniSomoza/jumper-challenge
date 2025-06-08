import { type AxiosResponse } from 'axios'

import Api from './Api'

const backendOrigin = import.meta.env.VITE_BACKEND_ORIGIN

// TODO: review this duplicity
export type BalanceProvider = {
  name: string
  logo: string
  decription: string
}

export type Balances = {
  address: string
  chainId: number
  tokens: ERC20TokenBalance[]
  provider: BalanceProvider
}

export type ERC20TokenBalance = {
  address: string
  balance: string
  name: string
  logo: string
  symbol: string
  decimals: number
  isSpamToken: boolean
  price?: TokenPrice
}

export type TokenPrice = {
  currency: string
  value: string
  updatedAt: string
}

export async function getBalances(
  address?: string,
  chainId?: number
): Promise<AxiosResponse<Balances>> {
  const getBalancesEndpoint = `${backendOrigin}/balances`

  if (address && chainId) {
    return await Api.get<Balances>(`${getBalancesEndpoint}?address=${address}&chainId=${chainId}`)
  }

  return await Api.get<Balances>(getBalancesEndpoint)
}
