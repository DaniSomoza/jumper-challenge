import { SiweMessage } from 'siwe'

import { createJWT, verifyJWT } from '../../lib/jwt'
import { createNonce } from '../../lib/nonce'
import { NONCE_EXPIRATION_TIME, SESSION_EXPIRATION_TIME } from '../../constants'
import UnauthorizedError from '../../errors/UnauthorizedError'

type jwtNoncePayload = { nonce: string; address: string; jwtType: 'nonce' }
type jwtSessionPayload = { address: string; jwtType: 'session' }

async function getNonce(address: string) {
  const nonce = createNonce()

  const jwtNoncePayload: jwtNoncePayload = { nonce, address, jwtType: 'nonce' }
  const nonceSigned = createJWT(jwtNoncePayload, NONCE_EXPIRATION_TIME)

  return {
    address,
    nonce,
    nonceSigned
  }
}

export type signInData = {
  siweMessageData: Partial<SiweMessage>
  message: string
  signature: string
  nonceSigned: string
}

async function signIn({ siweMessageData, message, signature, nonceSigned }: signInData) {
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
    const siweMessage = new SiweMessage(message)
    await siweMessage.verify({ signature })
  } catch {
    throw new UnauthorizedError('Invalid signature', { message, signature })
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

    // TODO: implement here
    //     if (address !== jwtSessionPayload.address && jwtSessionPayload.jwtType !== 'session') {
    //   throw new UnauthorizedError('Invalid session', { sessionToken, address })
    // }

    return { nonce, address, jwtType }
  } catch {
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
