import { useCallback } from 'react'
import { useSignMessage } from 'wagmi'
import { SiweMessage } from 'siwe'

function useSiweAuth() {
  const { signMessage } = useSignMessage()

  const signSiweMessage = useCallback(
    async (address: string, nonce: string, chainId: number) => {
      // build siwe message
      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to Jumper Code Challenge.',
        uri: window.location.origin,
        version: '1',
        chainId: chainId,
        nonce,
        issuedAt: new Date().toISOString()
      })

      const message = siweMessage.prepareMessage()

      // Adaptation of the callback-based signMessage API into a modern Promise-based interface to allow using async/await cleanly
      function signMessageAsync() {
        return new Promise<string>((resolve, reject) => {
          signMessage(
            { message },
            {
              onSuccess: resolve,
              onError: reject
            }
          )
        })
      }

      const signature = await signMessageAsync()

      return { signature, siweMessage, message }
    },
    [signMessage]
  )

  return {
    signSiweMessage
  }
}

export default useSiweAuth
