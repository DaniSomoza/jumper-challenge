export type Chain = {
  name: string
  chainId: number
  isTestnet: boolean
  network: string // used by Alchemy API
}

export const sepolia: Chain = {
  name: 'Sepolia',
  chainId: 11155111,
  isTestnet: true,
  network: 'eth-sepolia'
}

export const mainnet: Chain = {
  name: 'Ethereum',
  chainId: 1,
  isTestnet: false,
  network: 'eth-mainnet'
}

export const gnosis: Chain = {
  name: 'Gnosis',
  chainId: 100,
  isTestnet: false,
  network: 'gnosis-mainnet'
}

export const polygon: Chain = {
  name: 'Polygon',
  chainId: 137,
  isTestnet: false,
  network: 'polygon-mainnet'
}

export const avalanche: Chain = {
  name: 'Avalanche',
  chainId: 43114,
  isTestnet: false,
  network: 'avax-mainnet'
}

export const arbitrum: Chain = {
  name: 'Arbitrum',
  chainId: 42161,
  isTestnet: false,
  network: 'arb-mainnet'
}

export const base: Chain = {
  name: 'Base',
  chainId: 8453,
  isTestnet: false,
  network: 'base-mainnet'
}

export const optimism: Chain = {
  name: 'Optimism',
  chainId: 10,
  isTestnet: false,
  network: 'opt-mainnet'
}

const chains: Chain[] = [sepolia, mainnet, gnosis, polygon, avalanche, arbitrum, base, optimism]

export default chains
