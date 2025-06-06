import { useState } from 'react'
import viteLogo from '/vite.svg'
import { getDefaultConfig, RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { useAccount } from 'wagmi'

import '@rainbow-me/rainbowkit/styles.css'

import { AuthorizationProvider, useAuthorization } from '../store/AuthorizationContext'

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  // TODO: create a env var for WALLETCONNECT_PROJECT_ID
  projectId: 'YOUR_PROJECT_ID',
  chains: [sepolia, mainnet, polygon, optimism, arbitrum, base]
})
const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AuthorizationProvider>
            <Dapp />
          </AuthorizationProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App

function Dapp() {
  const [count, setCount] = useState(0)

  const account = useAccount()

  const isWalletConnected = !!account.address && account.isConnected

  const { signIn, isAuthenticated, sessionToken } = useAuthorization()

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>

        {!isWalletConnected ? (
          <ConnectButton />
        ) : (
          <>
            <p>connected with address {account.address}</p>

            {isAuthenticated ? (
              <div>
                <p>Authenticated!</p>

                <p>session token: {sessionToken}</p>
              </div>
            ) : (
              <button onClick={signIn}>login</button>
            )}
          </>
        )}
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  )
}
