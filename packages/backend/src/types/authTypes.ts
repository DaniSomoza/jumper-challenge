import { SiweMessage } from 'siwe'

// JWT payloads
export type jwtNoncePayload = { nonce: string; address: string; jwtType: 'nonce' }
export type jwtSessionPayload = { address: string; chainId: string; jwtType: 'session' }

// Siwe message data
export type SiweMessageData = Pick<
  SiweMessage,
  'address' | 'chainId' | 'domain' | 'nonce' | 'issuedAt' | 'uri' | 'version'
>

export type signInData = {
  siweMessageData: SiweMessageData
  signature: string
  nonceSigned: string
}
