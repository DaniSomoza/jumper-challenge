import { useCallback } from 'react'
import { useSignMessage } from 'wagmi'
import { SiweMessage } from 'siwe'

function useSiweAuth() {
  const { signMessageAsync } = useSignMessage()

  const signSiweMessage = useCallback(
    async (address: string, nonce: string, chainId: number) => {
      // build siwe message
      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to Jumper Code Challenge.',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
        issuedAt: new Date().toISOString()
      })

      const message = siweMessage.prepareMessage()

      const signature = await signMessageAsync({ message })

      return { signature, siweMessage }
    },
    [signMessageAsync]
  )

  return {
    signSiweMessage
  }
}

export default useSiweAuth
