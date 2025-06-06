import { generateNonce } from 'siwe'

export const createNonce = () => {
  return generateNonce()
}
