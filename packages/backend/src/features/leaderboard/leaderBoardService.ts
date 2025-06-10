import { mainnet, sepolia } from '../../chains/chains'
import leaderboardRepository from './leaderboardRepository'

const POINTS_BY_CHAIN: Record<number, number> = {
  [mainnet.chainId]: 3,
  [sepolia.chainId]: 1
}

async function savePoints(address: string, chainId: number) {
  const points = POINTS_BY_CHAIN[chainId] ?? 2

  await leaderboardRepository.createPoints({ address, points })

  return {
    address,
    points
  }
}

async function getLeaderboard() {
  const leaderboard = await leaderboardRepository.getLeaderboard()

  return leaderboard
}

const leaderboardService = {
  savePoints,
  getLeaderboard
}

export default leaderboardService
