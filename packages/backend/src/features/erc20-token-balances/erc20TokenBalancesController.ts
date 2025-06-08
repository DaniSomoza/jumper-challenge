import { FastifyReply, FastifyRequest } from 'fastify'
import StatusCodes from 'http-status-codes'

import handleErrorResponse from '../../errors/handleError'
import erc20TokenBalancesService from './erc20TokenBalancesService'
import UnauthorizedError from '../../errors/UnauthorizedError'

async function getBalances(request: FastifyRequest, response: FastifyReply) {
  try {
    const { address, chainId } = request.query as { address: string; chainId: string }

    const sessionCookie = request.cookies['session-cookie']

    if (sessionCookie) {
      const { value: sessionToken, valid } = request.unsignCookie(sessionCookie)

      if (!valid || !sessionToken) {
        throw new UnauthorizedError('Invalid session', { sessionToken })
      }

      const balances = await erc20TokenBalancesService.getBalances(address, chainId, sessionToken)

      return response.code(StatusCodes.OK).send(balances)
    }

    const balances = await erc20TokenBalancesService.getBalances(address, chainId)

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
