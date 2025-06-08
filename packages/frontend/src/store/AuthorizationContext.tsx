import { createContext, useCallback, useContext, useEffect, useState, type JSX } from 'react'
import { useAccount } from 'wagmi'

import authEndpoints from '../http/authEndpoints'
import useSiweAuth from '../hooks/useSiweAuth'
import { getBalances, type ERC20TokenBalance } from '../http/balancesEndpoints'

const initialContextValue = {
  address: '',
  isAuthenticated: false,
  isWalletConnected: false,
  signIn: () => Promise.resolve(),
  tokens: []
}

type authorizationContextValue = {
  address?: string
  isAuthenticated: boolean
  isWalletConnected: boolean
  signIn: () => Promise<void>
  tokens: ERC20TokenBalance[]
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
  const account = useAccount()
  const [tokens, setTokens] = useState<ERC20TokenBalance[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // TODO: isLoading state
  // TODO: implement expire session and logout properly

  const { address = '', chainId } = account
  const isWalletConnected = !!account.address && account.isConnected

  const { signSiweMessage } = useSiweAuth()

  const fetchBalances = useCallback(async () => {
    getBalances()
      .then(({ tokens }) => {
        console.log('tokens: ', tokens)

        setTokens(tokens)
        setIsAuthenticated(true)
      })
      .catch(() => {
        setIsAuthenticated(false)
      })
  }, [])

  const signIn = useCallback(async () => {
    if (!address || !chainId) {
      throw 'TODO: implement frontend side errors!'
    }

    const { nonce, nonceSigned } = await authEndpoints.getNonce(address)

    const { signature, siweMessage } = await signSiweMessage(address, nonce, chainId)

    await authEndpoints.signIn({
      siweMessageData: siweMessage,
      signature,
      nonceSigned
    })

    await fetchBalances()
  }, [address, signSiweMessage, chainId, fetchBalances])

  // We check here if the user is autenticated or not
  useEffect(() => {
    if (isWalletConnected) {
      fetchBalances()
    }
  }, [isWalletConnected, fetchBalances])

  const value = {
    isWalletConnected,
    isAuthenticated,
    address,
    signIn,
    tokens
  }

  return <authorizationContext.Provider value={value}>{children}</authorizationContext.Provider>
}

export { useAuthorization, AuthorizationProvider }
