import { FastifyReply, FastifyRequest } from 'fastify'
import StatusCodes from 'http-status-codes'

import handleErrorResponse from '../../errors/handleError'
import leaderboardService from './leaderBoardService'

async function getLeaderboard(_: FastifyRequest, response: FastifyReply) {
  try {
    const balances = await leaderboardService.getLeaderboard()

    return response.code(StatusCodes.OK).send(balances)
  } catch (error) {
    const { code, body } = handleErrorResponse(error)

    return response.code(code).send(body)
  }
}

const leaderboardController = {
  getLeaderboard
}

export default leaderboardController
