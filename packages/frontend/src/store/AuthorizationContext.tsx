import { createContext, useCallback, useContext, useEffect, useState, type JSX } from 'react'
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi'

import authEndpoints from '../http/authEndpoints'
import useSiweAuth from '../hooks/useSiweAuth'
import { getBalances, type Balances } from '../http/balancesEndpoints'

const initialContextValue = {
  address: '',
  isAuthenticated: false,
  isWalletConnected: false,
  isDisconnecting: false,
  signIn: () => Promise.resolve(),
  logout: () => {},
  fetchBalances: () => Promise.resolve(),
  balances: undefined
  // TODO: loading states
}

type authorizationContextValue = {
  address?: string
  chainId?: number
  isAuthenticated: boolean
  isWalletConnected: boolean
  isDisconnecting: boolean
  switchChain?: ({ chainId }: { chainId: number }) => void
  signIn: (chainId: number) => Promise<void>
  logout: () => void
  fetchBalances: () => Promise<void>
  balances?: Balances
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
  const [balances, setBalances] = useState<Balances>()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  const { disconnect, isPending: isDisconnecting } = useDisconnect()

  const { switchChain } = useSwitchChain()

  const logout = useCallback(() => {
    disconnect()
    setIsAuthenticated(false)
  }, [])

  const { address = '', chainId } = account
  const isWalletConnected = !!account.address && account.isConnected

  const { signSiweMessage } = useSiweAuth()

  const fetchBalances = useCallback(async () => {
    setBalances(undefined)

    try {
      const balances = await getBalances()

      setBalances(balances)
      setIsAuthenticated(true)
    } catch {
      // TODO: handle error si 401...
      setIsAuthenticated(false)
      setBalances(undefined)

      // TODO: si el error es BadGatewayError o 502 => fallaron los endpoints de alchemy
    }
  }, [switchChain])

  const signIn = useCallback(
    async (chainId: number) => {
      if (!address || !chainId) {
        throw 'TODO: implement frontend side errors!'
      }

      const { nonce, nonceSigned } = await authEndpoints.getNonce(address)

      try {
        const { signature, siweMessage } = await signSiweMessage(address, nonce, chainId)

        await authEndpoints.signIn({
          siweMessageData: siweMessage,
          signature,
          nonceSigned
        })
      } catch (error) {
        // TODO: show sign in button again!!
        console.log('SIGN IN FAILED! => ', error)
      }
    },
    [address, signSiweMessage]
  )

  // We check here if the user is autenticated or not
  useEffect(() => {
    if (isWalletConnected) {
      fetchBalances()
      // TODO: set the correct chain if 200
    }
  }, [isWalletConnected, fetchBalances])

  // switch chain => signIn => getBalances
  useEffect(() => {
    if (chainId) {
      signIn(chainId).then(() => {
        fetchBalances()
      })
    }
  }, [chainId])

  const value = {
    isWalletConnected,
    isAuthenticated,
    address,
    chainId,
    switchChain,
    signIn,
    logout,
    isDisconnecting,
    fetchBalances,
    balances
  }

  return <authorizationContext.Provider value={value}>{children}</authorizationContext.Provider>
}

export { useAuthorization, AuthorizationProvider }
