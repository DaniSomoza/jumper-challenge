import { FastifyReply, FastifyRequest } from 'fastify'
import StatusCodes from 'http-status-codes'

import handleErrorResponse from '../../errors/handleError'
import erc20TokenBalancesService from './erc20TokenBalancesService'

async function getBalances(request: FastifyRequest, response: FastifyReply) {
  try {
    const { address, chainId } = request.query as { address: string; chainId: string }

    const sessionToken = getSessionTokenFromAuthHeader(request)

    const balances = await erc20TokenBalancesService.getBalances(sessionToken, address, chainId)

    return response.code(StatusCodes.OK).send(balances)
  } catch (error) {
    const { code, body } = handleErrorResponse(error)

    return response.code(code).send(body)
  }
}

const erc20TokenBalancesController = {
  getBalances
}

export default erc20TokenBalancesController

function getSessionTokenFromAuthHeader(request: FastifyRequest): string | undefined {
  const authorizationHeader = request.headers.authorization

  return authorizationHeader?.replace('Bearer ', '')
}
