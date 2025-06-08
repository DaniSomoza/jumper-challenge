import { useAccount } from 'wagmi'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'

import jumperLogo from '/jumper.svg'
import ChainSelector from '../chain-selector/ChainSelector'

function Header() {
  const account = useAccount()
  const isWalletConnected = !!account.address && account.isConnected

  return (
    <AppBar position="static">
      <Toolbar>
        <Box flexGrow={1}>
          <img src={jumperLogo} className="logo" alt="Jumper logo" />
        </Box>

        {/* TODO: create an AddressLabel component */}
        {isWalletConnected && <div>{account.address}</div>}

        <ChainSelector />
      </Toolbar>
    </AppBar>
  )
}

export default Header
