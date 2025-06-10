import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'

import jumperLogo from '/jumper.svg'
import ChainSelector from '../chain-selector/ChainSelector'
import { useAuthorization } from '../../store/AuthorizationContext'
import ConnectedWallet from '../connected-wallet/ConnectedWallet'

function Header() {
  const { address, isWalletConnected, logout, isDisconnecting, chain } = useAuthorization()

  const isMobile = useMediaQuery('(max-width:600px)')

  return (
    <AppBar position="static">
      <Toolbar>
        <Box flexGrow={1}>
          {!isMobile && <img src={jumperLogo} className="logo" alt="Jumper logo" />}
        </Box>

        {isWalletConnected && address && chain && (
          <ConnectedWallet
            address={address}
            chain={chain}
            logout={logout}
            isDisconnecting={isDisconnecting}
          />
        )}

        <ChainSelector />
      </Toolbar>
    </AppBar>
  )
}

export default Header
