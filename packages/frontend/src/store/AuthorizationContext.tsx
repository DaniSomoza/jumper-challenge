import { createContext, useCallback, useContext, useState, type JSX } from 'react'
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi'
import type { Chain } from 'wagmi/chains'

import authEndpoints from '../http/authEndpoints'
import useSiweAuth from '../hooks/useSiweAuth'

const initialContextValue = {
  address: '',
  isAuthenticated: true,
  setIsAuthenticated: () => {},
  isWalletConnected: false,
  isDisconnecting: false,
  isSwitchChainLoading: false,
  signIn: () => Promise.resolve(),
  logout: () => {}
}

type authorizationContextValue = {
  address?: string
  chainId?: number
  chain?: Chain
  isAuthenticated: boolean
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  isWalletConnected: boolean
  isDisconnecting: boolean
  isSwitchChainLoading: boolean
  switchChain?: ({ chainId }: { chainId: number }) => void
  signIn: (chainId: number) => Promise<void>
  logout: () => void
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true)

  const { disconnect, isPending: isDisconnecting } = useDisconnect()

  const { switchChain, isPending: isSwitchChainLoading } = useSwitchChain()

  // Note: For a complete logout, the session cookie should also be cleared on the server-side.
  // Since httpOnly cookies cannot be accessed or deleted from the frontend (by design, for security),
  // it's recommended to implement a /logout backend endpoint that clears the cookie.
  const logout = useCallback(() => {
    disconnect()
    setIsAuthenticated(false)
  }, [])

  const { address = '', chainId } = account
  const isWalletConnected = !!account.address && account.isConnected

  const { signSiweMessage } = useSiweAuth()

  const signIn = useCallback(
    async (chainId: number) => {
      if (!address) {
        return
      }

      const { nonce, nonceSigned } = await authEndpoints.getNonce(address)

      try {
        const { signature, siweMessage } = await signSiweMessage(address, nonce, chainId)

        await authEndpoints.signIn({
          siweMessageData: siweMessage,
          signature,
          nonceSigned
        })

        setIsAuthenticated(true)
      } catch (error) {
        setIsAuthenticated(false)
        throw error
      }
    },
    [address, signSiweMessage]
  )

  const value = {
    isWalletConnected,
    isAuthenticated,
    setIsAuthenticated,
    isSwitchChainLoading,
    address,
    chainId,
    chain: account.chain,
    switchChain,
    signIn,
    logout,
    isDisconnecting
  }

  return <authorizationContext.Provider value={value}>{children}</authorizationContext.Provider>
}

export { useAuthorization, AuthorizationProvider }
