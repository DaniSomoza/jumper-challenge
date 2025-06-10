import { formatUnits } from 'viem'
import type { Chain } from 'wagmi/chains'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import CardContent from '@mui/material/CardContent'

import emptyTokenLogo from '/empty_token_placeholder.webp'
import { type ERC20TokenBalance } from '../../http/balancesEndpoints'
import AddressLabel from '../address-label/AddressLabel'

type TokenCardProps = {
  token: ERC20TokenBalance
  chain?: Chain
}

const ERC20_LOGO_SIZE = 86 // px
const ERC20_CARD_SIZE = 200 // px

function TokenCard({ token, chain }: TokenCardProps) {
  const hasPrice = token.price && token.price.value

  return (
    <Card variant="outlined" sx={{ width: ERC20_CARD_SIZE, padding: 1, paddingTop: 2 }}>
      <Box display={'flex'} justifyContent={'center'}>
        <Avatar
          src={token.logo || emptyTokenLogo}
          alt={token.name}
          sx={{
            height: ERC20_LOGO_SIZE,
            width: ERC20_LOGO_SIZE
          }}
        />
      </Box>

      <CardContent>
        <Typography
          variant="h6"
          align="center"
          noWrap
          sx={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}
        >
          {token.name || 'ERC20 Token'}
        </Typography>

        {chain && <AddressLabel address={token.address} chain={chain} />}

        <Typography
          variant="subtitle2"
          align="center"
          color="gray"
          noWrap
          sx={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}
        >
          {formatAmount(token.balance, token.decimals, 4)} {token.symbol}
        </Typography>

        <Typography variant="body2" align="center" color="gray">
          {hasPrice ? `${token?.price?.value} ${token?.price?.currency}` : '0 $'}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default TokenCard

function formatAmount(amount: string, decimals: number, precision = 4) {
  return parseFloat(formatUnits(BigInt(amount), decimals))
    .toFixed(precision)
    .replace(/\.?0+$/, '') // from xx.yyy0000 => xx.yyy
}
