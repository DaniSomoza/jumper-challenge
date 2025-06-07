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
