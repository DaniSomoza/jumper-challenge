import { Route } from '../../server/Server'
import leaderboardController from './leaderboardController'

export const LEADERBOARD_PATH = '/leaderboard'

const getLeaderboardRoute: Route = {
  url: LEADERBOARD_PATH,
  method: 'GET',
  handler: leaderboardController.getLeaderboard
}

const leaderboardRoutes = [getLeaderboardRoute]

export default leaderboardRoutes
