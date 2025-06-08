import type { SiweMessage } from 'siwe'
import axios from 'axios'

const backendOrigin = import.meta.env.VITE_BACKEND_ORIGIN

type NonceResponse = {
  address: string
  nonce: string
  nonceSigned: string
}

export async function getNonce(address: string): Promise<NonceResponse> {
  const getNonceEndpoint = `${backendOrigin}/auth/nonce/${address}`

  const response = await axios.get<NonceResponse>(getNonceEndpoint, {
    withCredentials: true
  })

  return response.data
}

export type SignInBodyData = {
  siweMessageData: Partial<SiweMessage>
  signature: string
  nonceSigned: string
}

type SessionResponse = {
  sessionToken: string
}

export async function signIn({
  siweMessageData,
  signature,
  nonceSigned
}: SignInBodyData): Promise<SessionResponse> {
  const signInEndpoint = `${backendOrigin}/auth/session`

  const payload = { siweMessageData, signature, nonceSigned }

  const response = await axios.post<SessionResponse>(signInEndpoint, payload, {
    withCredentials: true
  })

  return response.data
}

const authEndpoints = {
  getNonce,
  signIn
}

export default authEndpoints
