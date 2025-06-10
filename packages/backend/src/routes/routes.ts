import authRoutes from '../features/auth/authRoutes'
import erc20TokenBalancesRoutes from '../features/erc20-token-balances/erc20TokenBalancesRoutes'
import leaderboardRoutes from '../features/leaderboard/leaderBoardRoutes'

const routes = [...authRoutes, ...erc20TokenBalancesRoutes, ...leaderboardRoutes]

export default routes
