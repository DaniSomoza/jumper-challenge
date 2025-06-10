import { FastifyReply, FastifyRequest } from 'fastify'
import StatusCodes from 'http-status-codes'

import authService from './authService'
import handleErrorResponse from '../../errors/handleError'
import { COOKIE_EXPIRATION_TIME } from '../../constants'
import { signInData } from '../../types/authTypes'

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

async function signIn(request: FastifyRequest, response: FastifyReply) {
  try {
    const { siweMessageData, signature, nonceSigned } = request.body as signInData

    const { sessionToken } = await authService.signIn({
      siweMessageData,
      signature,
      nonceSigned
    })

    // Set a secure cookie
    response.setCookie('session-cookie', sessionToken, {
      httpOnly: true, // Mitigates XSS: disallows JavaScript access to the cookie
      secure: true, // Ensures cookie is only sent over HTTPS
      sameSite: 'lax', // Helps prevent CSRF attacks (reasonable default)
      signed: true, // Signs the cookie to prevent tampering on the client
      path: '/', // Cookie is valid for entire domain
      maxAge: COOKIE_EXPIRATION_TIME // Expiration time (in seconds)
    })

    return response.code(StatusCodes.OK).send({})
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
