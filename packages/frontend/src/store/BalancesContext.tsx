import { createContext, useCallback, useContext, useEffect, useRef, type JSX } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getBalances, type Balances } from '../http/balancesEndpoints'
import { useAuthorization } from './AuthorizationContext'
import type { AxiosError } from 'axios'

const initialContextValue = {
  fetchBalances: () => Promise.resolve(),
  balances: undefined,
  isBalancesLoading: true,
  isBalancesError: false,
  isBalancesFetching: true,
  error: undefined
}

type balancesContextValue = {
  fetchBalances: () => Promise<void>
  balances?: Balances
  isBalancesLoading: boolean
  isBalancesError: boolean
  isBalancesFetching: boolean
  error?: AxiosError | null // TODO: change this to a Frontend error???
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
  const { setIsAuthenticated, isAuthenticated, chainId, signIn } = useAuthorization()

  const {
    data: balances,
    refetch,
    isLoading: isBalancesLoading,
    isError: isBalancesError,
    isFetching: isBalancesFetching,
    error
  } = useQuery<Balances, AxiosError, Balances, ['balances']>({
    queryKey: ['balances'],
    queryFn: async () => {
      try {
        const balances = await getBalances()
        setIsAuthenticated(true)

        return balances
      } catch (error) {
        // TODO: if 401
        setIsAuthenticated(false)

        throw error
      }
    },
    enabled: isAuthenticated,
    retry: false
  })

  const previousChainId = useRef<number | undefined>(undefined)

  // switch chain => signIn => getBalances
  useEffect(() => {
    const chainHasChanged =
      previousChainId.current !== undefined && previousChainId.current !== chainId

    if (chainHasChanged && chainId) {
      signIn(chainId).then(() => {
        refetch()
      })
    }

    previousChainId.current = chainId
  }, [chainId, signIn])

  const fetchBalances = useCallback(async () => {
    await refetch()
  }, [])

  const value = {
    fetchBalances,
    balances,
    isBalancesLoading,
    isBalancesError,
    isBalancesFetching,
    // TODO: create wrap of the backend error to a FrontendError
    error
  }

  return <balancesContext.Provider value={value}>{children}</balancesContext.Provider>
}

export { useBalances, BalancesProvider }
