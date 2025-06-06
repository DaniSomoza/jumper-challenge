import { SiweMessage } from 'siwe'

import { createJWT, verifyJWT } from '../../lib/jwt'
import { createNonce } from '../../lib/nonce'
import { NONCE_EXPIRATION_TIME, SESSION_EXPIRATION_TIME } from '../../constants'
import UnauthorizedError from '../../errors/UnauthorizedError'
import { isAddress } from 'ethers'
import BadRequestError from '../../errors/BadRequestError'
import { TokenExpiredError } from 'jsonwebtoken'

type jwtNoncePayload = { nonce: string; address: string; jwtType: 'nonce' }
type jwtSessionPayload = { address: string; jwtType: 'session' }

async function getNonce(address: string) {
  if (!isAddress(address)) {
    throw new BadRequestError('Invalid address', { address })
  }

  const nonce = createNonce()

  const jwtNoncePayload: jwtNoncePayload = { nonce, address, jwtType: 'nonce' }
  const nonceSigned = createJWT(jwtNoncePayload, NONCE_EXPIRATION_TIME)

  return {
    address,
    nonce,
    nonceSigned
  }
}

// TODO: create types file
export type SiweMessageData = Pick<
  SiweMessage,
  'address' | 'chainId' | 'domain' | 'nonce' | 'issuedAt' | 'uri' | 'version'
>

export type signInData = {
  siweMessageData: SiweMessageData
  signature: string
  nonceSigned: string
}

async function signIn({ siweMessageData, signature, nonceSigned }: signInData) {
  if (!nonceSigned) {
    throw new BadRequestError('Missing nonceSigned')
  }

  if (!signature) {
    throw new BadRequestError('Missing signature')
  }

  validateSiweMessageData(siweMessageData)

  const { nonce, address, jwtType } = verifyNonce(nonceSigned)

  if (nonce !== siweMessageData.nonce || jwtType !== 'nonce') {
    throw new UnauthorizedError('Invalid nonce', { nonce, address })
  }

  if (address !== siweMessageData.address && !!siweMessageData.address) {
    throw new UnauthorizedError('Invalid address', {
      nonce,
      address,
      expectedAddress: siweMessageData.address
    })
  }

  try {
    const siweMessage = new SiweMessage(siweMessageData)

    await siweMessage.verify({ signature })
  } catch {
    throw new UnauthorizedError('Invalid signature', {
      message: siweMessageData,
      signature
    })
  }

  const jwtSessionPayload: jwtSessionPayload = { address, jwtType: 'session' }
  const sessionToken = createJWT(jwtSessionPayload, SESSION_EXPIRATION_TIME)

  return {
    sessionToken
  }
}

type sessionData = {
  sessionToken: string
  address: string
}

function verifySession({ sessionToken, address }: sessionData) {
  try {
    const jwtSessionPayload = verifyJWT<jwtSessionPayload>(sessionToken)

    if (address !== jwtSessionPayload.address && jwtSessionPayload.jwtType !== 'session') {
      throw new UnauthorizedError('Invalid session', { sessionToken, address })
    }

    return jwtSessionPayload
  } catch {
    throw new UnauthorizedError('Invalid session', { sessionToken, address })
  }
}

function verifyNonce(nonceSigned: string) {
  try {
    const { nonce, address, jwtType } = verifyJWT<jwtNoncePayload>(nonceSigned)

    return { nonce, address, jwtType }
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new UnauthorizedError('Invalid nonce', {
        reason: 'Nonce Expired Error',
        expiredAt: error.expiredAt.toISOString(),
        nonceSigned
      })
    }

    // this nonce was not generated by the server (jwt nonceSigned is not valid)
    throw new UnauthorizedError('Invalid nonce', { nonceSigned })
  }
}

const authService = {
  getNonce,
  signIn,
  verifySession,
  verifyNonce
}

export default authService

function validateSiweMessageData(siweMessageData: SiweMessageData) {
  // NOTE: validateSiweMessageData is intentionally simplified for the purpose of this coding challenge.
  // In a production-ready application, additional validations and security checks should be implemented.

  if (!isAddress(siweMessageData.address)) {
    throw new BadRequestError('Invalid address field in siwe message')
  }

  if (!siweMessageData.chainId) {
    throw new BadRequestError('Missing chainId field in siwe message')
  }

  if (typeof siweMessageData.chainId !== 'number') {
    throw new BadRequestError('Invalid chainId field in siwe message')
  }

  if (!siweMessageData.domain) {
    throw new BadRequestError('Missing domain field in siwe message')
  }

  if (!siweMessageData.nonce) {
    throw new BadRequestError('Missing nonce field in siwe message')
  }
}
