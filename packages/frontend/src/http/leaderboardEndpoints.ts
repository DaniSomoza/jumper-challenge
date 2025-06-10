import axios from 'axios'

export type LeaderboardType = {
  address: string
  totalPoints: number
}[]

const backendOrigin = import.meta.env.VITE_BACKEND_ORIGIN

export async function getLeaderboard(): Promise<LeaderboardType> {
  const leaderboardEndpoint = `${backendOrigin}/leaderboard`

  const response = await axios.get<LeaderboardType>(leaderboardEndpoint, { withCredentials: true })

  return response.data
}
