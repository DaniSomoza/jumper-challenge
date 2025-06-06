import { FastifyReply, FastifyRequest } from 'fastify'
import StatusCodes from 'http-status-codes'

import authService, { SiweMessageData } from './authService'
import handleErrorResponse from '../../errors/handleError'

async function getNonce(request: FastifyRequest, response: FastifyReply) {
  try {
    const { address } = request.params as { address: string }

    const { nonce, nonceSigned } = await authService.getNonce(address)

    const payload = {
      address,
      nonce,
      nonceSigned
    }

    return response.code(StatusCodes.OK).send(payload)
  } catch (error) {
    const { code, body } = handleErrorResponse(error)

    return response.code(code).send(body)
  }
}

export type signInBodyData = {
  siweMessageData: SiweMessageData
  signature: string
  nonceSigned: string
}

async function signIn(request: FastifyRequest, response: FastifyReply) {
  try {
    const { siweMessageData, signature, nonceSigned } = request.body as signInBodyData

    const { sessionToken } = await authService.signIn({
      siweMessageData,
      signature,
      nonceSigned
    })

    return response.code(StatusCodes.OK).send({ sessionToken })
  } catch (error) {
    const { code, body } = handleErrorResponse(error)
    return response.code(code).send(body)
  }
}

const authController = {
  getNonce,
  signIn
}

export default authController
