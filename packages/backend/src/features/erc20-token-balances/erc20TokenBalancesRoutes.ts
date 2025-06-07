import { Route } from '../../server/Server'
import erc20TokenBalancesController from './erc20TokenBalancesController'

export const BALANCES_PATH = '/balances'

const getBalancesRoute: Route = {
  url: BALANCES_PATH,
  method: 'GET',
  handler: erc20TokenBalancesController.getBalances
}

const erc20TokenBalancesRoutes = [getBalancesRoute]

export default erc20TokenBalancesRoutes
