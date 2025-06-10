import type { Chain } from 'wagmi/chains'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import AddressLabel from '../address-label/AddressLabel'

type ConnectedWalletProps = {
  chain: Chain
  address: string
  logout: () => void
  isDisconnecting: boolean
}

function ConnectedWallet({ address, logout, chain, isDisconnecting }: ConnectedWalletProps) {
  return (
    <Paper variant={'outlined'} sx={{ padding: 0.5 }}>
      <Tooltip title={address} arrow>
        <Stack direction={'row'} alignItems={'center'} spacing={1}>
          <AccountBalanceWalletIcon fontSize="small" color="primary" />

          <AddressLabel address={address} chain={chain} />

          <Tooltip title="Disconnect Wallet" arrow placement="right">
            <IconButton onClick={logout} loading={isDisconnecting} size="small" color="primary">
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Tooltip>
    </Paper>
  )
}

export default ConnectedWallet
