import axios from 'axios'

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

export async function getBalances(address?: string, chainId?: number): Promise<Balances> {
  const balancesEndpoint = `${backendOrigin}/balances`

  // TODO: remove this log
  console.log('>>> CALLING GET BALACES ENDPOINT!!!')

  if (address && chainId) {
    const queryParams = `address=${address}&chainId=${chainId}`

    const response = await axios.get<Balances>(`${balancesEndpoint}?${queryParams}`)

    return response.data
  }

  const response = await axios.get<Balances>(balancesEndpoint, { withCredentials: true })

  return response.data
}
