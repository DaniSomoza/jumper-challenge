import { getDefaultConfig, RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit'
import { WagmiProvider, useAccount } from 'wagmi'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'

import '@rainbow-me/rainbowkit/styles.css'

import { AuthorizationProvider, useAuthorization } from '../store/AuthorizationContext'
import chains from '../chains/chains'
import Balances from './balances/Balances'
import Header from './header/Header'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

function App() {
  const account = useAccount()

  const isWalletConnected = !!account.address && account.isConnected

  const { signIn, isAuthenticated } = useAuthorization()

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

        {!isWalletConnected ? (
          <Box component="section" display={'flex'} justifyContent={'center'} mt={5}>
            <ConnectButton />
          </Box>
        ) : (
          <>
            {isAuthenticated ? (
              <Balances />
            ) : (
              <Box
                component="section"
                flexDirection={'column'}
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
                mt={5}
              >
                <Button onClick={signIn} variant="contained">
                  signIn
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
  appName: 'My RainbowKit App',
  // TODO: create a env var for WALLETCONNECT_PROJECT_ID
  projectId: 'YOUR_PROJECT_ID',
  chains: [chains[0], ...chains.slice(1)]
})

const queryClient = new QueryClient()

// TODO: create a themeProvider to customize the MUI theme
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
            <ThemeProvider theme={darkTheme}>
              <App />
            </ThemeProvider>
          </AuthorizationProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default AppProviders
