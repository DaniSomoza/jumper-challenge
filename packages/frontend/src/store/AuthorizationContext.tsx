import { createContext, useCallback, useContext, useEffect, useState, type JSX } from 'react'
import { useAccount } from 'wagmi'

import Api from '../api/Api'
import authEndpoints from '../api/authEndpoints'
import useSiweAuth from '../hooks/useSiweAuth'

const initialContextValue = {
  sessionToken: '',
  address: '',
  isAuthenticated: false,
  signIn: () => Promise.resolve('')
}

type authorizationContextValue = {
  sessionToken: string
  address?: string
  isAuthenticated: boolean
  signIn: () => Promise<string>
}

const authorizationContext = createContext<authorizationContextValue>(initialContextValue)

function useAuthorization() {
  const context = useContext(authorizationContext)

  if (!context) {
    throw new Error('useAuthorization should be within AuthorizationContext Provider')
  }

  return context
}

type AuthorizationProviderProps = {
  children: JSX.Element | JSX.Element[]
}

function AuthorizationProvider({ children }: AuthorizationProviderProps) {
  // const [sessionToken, setSessionToken] = useLocalStorageState(SESSION_TOKEN_STORAGE_KEY, '')
  const [sessionToken, setSessionToken] = useState('')

  const account = useAccount()

  const { signSiweMessage } = useSiweAuth()

  const { address = '', chainId } = account
  const isAuthenticated = !!sessionToken

  // TODO: implement expire session and logout properly

  useEffect(() => {
    // logout
    setSessionToken('')
  }, [address])

  useEffect(() => {
    Api.setSessionToken(sessionToken)
  }, [sessionToken])

  const signIn = useCallback(async () => {
    if (!address || !chainId) {
      throw 'TODO: implement frontend side errors!'
    }

    const getNonceApiResponse = await authEndpoints.getNonce(address)

    const { nonce, nonceSigned } = getNonceApiResponse.data

    const { signature, siweMessage, message } = await signSiweMessage(address, nonce, chainId)

    const signInApiResponse = await authEndpoints.signIn({
      siweMessageData: siweMessage,
      message,
      signature,
      nonceSigned
    })

    const { sessionToken } = signInApiResponse.data

    setSessionToken(sessionToken)

    return sessionToken
  }, [address, signSiweMessage, chainId])

  const value = {
    sessionToken,
    isAuthenticated,
    address,
    signIn
  }

  return <authorizationContext.Provider value={value}>{children}</authorizationContext.Provider>
}

export { useAuthorization, AuthorizationProvider }
