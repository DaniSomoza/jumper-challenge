import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import jumperLogo from '/jumper.svg'
import ChainSelector from '../chain-selector/ChainSelector'
import { useAuthorization } from '../../store/AuthorizationContext'

function Header() {
  const { address, isWalletConnected, logout, isDisconnecting } = useAuthorization()

  return (
    <AppBar position="static">
      <Toolbar>
        <Box flexGrow={1}>
          <img src={jumperLogo} className="logo" alt="Jumper logo" />
        </Box>

        {/* TODO: create an AddressLabel component */}
        {isWalletConnected && <div>{address}</div>}

        {/* TODO: add logout component */}
        {isWalletConnected && (
          <Tooltip title="Disconnect Wallet" arrow>
            <IconButton onClick={logout} loading={isDisconnecting}>
              <LogoutRoundedIcon />
            </IconButton>
          </Tooltip>
        )}

        <ChainSelector />
      </Toolbar>
    </AppBar>
  )
}

export default Header
