import { getDefaultConfig, RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'

import '@rainbow-me/rainbowkit/styles.css'

import { AuthorizationProvider, useAuthorization } from '../store/AuthorizationContext'
import chains from '../chains/chains'
import BalanceList from './balances/BalanceList'
import Header from './header/Header'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { BalancesProvider, useBalances } from '../store/BalancesContext'
import Alert from '@mui/material/Alert'

function App() {
  const { chainId, signIn, isWalletConnected, isAuthenticated } = useAuthorization()

  const { balances, isBalancesLoading, isBalancesError, isBalancesFetching, error } = useBalances()

  const showIncompatibleChainDetected = chainId && !chains.some((chain) => chain.id === chainId)

  return (
    <>
      <CssBaseline />

      <Header />

      <Container maxWidth="lg" component="main">
        <Box display={'flex'} justifyContent={'center'} mt={5}>
          <Typography component={'h1'} variant="h4">
            Jumper Code challenge
          </Typography>
        </Box>

        {showIncompatibleChainDetected && (
          <Box display={'flex'} justifyContent={'center'} mt={2}>
            <Alert severity="warning">Unsupported Chain detected.</Alert>
          </Box>
        )}

        {!isWalletConnected ? (
          <Box component="section" display={'flex'} justifyContent={'center'} mt={3}>
            <ConnectButton />
          </Box>
        ) : (
          <>
            {isAuthenticated ? (
              <BalanceList
                balances={balances}
                isLoading={isBalancesLoading}
                isBalancesError={isBalancesError}
                isBalancesFetching={isBalancesFetching}
                error={error}
              />
            ) : (
              <Box
                component="section"
                flexDirection={'column'}
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
                mt={5}
                gap={2}
              >
                <Alert severity="success"> Wallet connected</Alert>

                <Typography variant="body1" align="center">
                  Please sign a SIWE message to complete authentication.
                </Typography>

                <Button onClick={() => signIn(chainId!)} variant="contained">
                  Sign In with Ethereum
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>
    </>
  )
}

const config = getDefaultConfig({
  appName: 'Jumper code challenge App',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [chains[0], ...chains.slice(1)]
})

const queryClient = new QueryClient()

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  }
})

function AppProviders() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AuthorizationProvider>
            <BalancesProvider>
              <ThemeProvider theme={darkTheme}>
                <App />
              </ThemeProvider>
            </BalancesProvider>
          </AuthorizationProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default AppProviders
