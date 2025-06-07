import axios from 'axios'

import { Chain } from '../../../chains/chains'
import { morallisApiKey } from '../../../constants'
import { BalanceProvider, Balances, ERC20TokenBalance } from '../BalancesTypes'

type MorallisBalances = {
  token_address: string
  symbol: string
  name: string
  logo: string | null
  thumbnail: string | null
  decimals: number | 0
  balance: string
  possible_spam: boolean
  verified_contract: boolean
  total_supply: string
  total_supply_formatted: string
  percentage_relative_to_total_supply: number
  security_score: string | null
}[]

const morallisProvider: BalanceProvider = {
  name: 'Morallis',
  logo: 'https://moralis.com/_next/static/media/MoralisMoneyLogomark.968154c8.svg',
  decription:
    'Seamlessly access rich blockchain data and integrate NFTs, ERC20 tokens, DeFi protocols, transaction history, and more into your dapps.'
}

export async function getBalancesFromMorallis(address: string, chain: Chain): Promise<Balances> {
  const url = ` https://deep-index.moralis.io/api/v2.2/${address}/erc20?chain=0x${chain.chainId.toString(16)}`

  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': morallisApiKey
  }

  const response = await axios.get(url, { headers })

  const morallisBalances = response.data as MorallisBalances

  // parsing from Morallis schema to our Balances Schema
  const tokens: ERC20TokenBalance[] = morallisBalances.map((tokenBalance) => ({
    address: tokenBalance.token_address,
    balance: tokenBalance.balance,
    name: tokenBalance.name,
    logo: tokenBalance.balance,
    symbol: tokenBalance.symbol,
    decimals: tokenBalance.decimals,
    isSpamToken: tokenBalance.possible_spam
    // no price available in the Morallis API
  }))

  return {
    address,
    chainId: chain.chainId,
    tokens,
    provider: morallisProvider
  }
}
