import authRoutes from '../features/auth/authRoutes'
import erc20TokenBalancesRoutes from '../features/erc20-token-balances/erc20TokenBalancesRoutes'

const routes = [...authRoutes, ...erc20TokenBalancesRoutes]

export default routes
