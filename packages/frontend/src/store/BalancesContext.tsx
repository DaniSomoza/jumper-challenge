import { createContext, useCallback, useContext, useEffect, useState, type JSX } from 'react'

import { getBalances, type Balances } from '../http/balancesEndpoints'
import { useAuthorization } from './AuthorizationContext'

const initialContextValue = {
  fetchBalances: () => Promise.resolve(),
  balances: undefined
  // TODO: loading states
}

type balancesContextValue = {
  fetchBalances: () => Promise<void>
  balances?: Balances
}

const balancesContext = createContext<balancesContextValue>(initialContextValue)

function useBalances() {
  const context = useContext(balancesContext)

  if (!context) {
    throw new Error('useBalances should be within BalancesContext Provider')
  }

  return context
}

type BalancesProviderProps = {
  children: JSX.Element | JSX.Element[]
}

function BalancesProvider({ children }: BalancesProviderProps) {
  const { setIsAuthenticated, isWalletConnected, chainId, signIn } = useAuthorization()

  const [balances, setBalances] = useState<Balances>()

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
  }, [])

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
    fetchBalances,
    balances
  }

  return <balancesContext.Provider value={value}>{children}</balancesContext.Provider>
}

export { useBalances, BalancesProvider }
