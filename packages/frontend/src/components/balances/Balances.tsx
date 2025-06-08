import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

import emptyTokenLogo from '/empty_token_placeholder.webp'
import { getBalances, type ERC20TokenBalance } from '../../api/balancesEndpoints'
import Avatar from '@mui/material/Avatar'
import CardContent from '@mui/material/CardContent'
import { formatUnits } from 'viem'

function Balances() {
  const [tokens, setTokens] = useState<ERC20TokenBalance[]>([])

  // TODO: API call error hanlder

  // TODO: SHOW PROVIDER (ALCHEMY OR MORALIS)

  // TODO: call endpoint balances
  useEffect(() => {
    // call to the endpoint

    // TODO: if 401 logout!!!

    getBalances().then((response) => {
      console.log('response: ', response)

      setTokens(response.data.tokens)
    })
  }, [])

  // TODO: implement custom address or chainId in the frontend

  return (
    <Box
      component="section"
      flexDirection={'column'}
      display={'flex'}
      justifyContent={'center'}
      mt={5}
    >
      <Typography component={'h2'} variant="h4">
        Balances
      </Typography>

      <Typography>Your ERC20 Tokens:</Typography>

      {tokens.length === 0 ? (
        <Typography>0 ERC20 Tokens found...</Typography>
      ) : (
        <Grid container spacing={2} padding={1}>
          {tokens.map((token) => {
            // TODO: create a token list component?
            // TODO: show address in etherscan

            // TODO: No tokens present!

            // TODO: format amount based on decimals!

            return <TokenCard token={token} key={token.address} />
          })}
        </Grid>
      )}
    </Box>
  )
}

export default Balances

// TODO: create a helper in the frontend
function formatAmount(amount: string, decimals: number, precision = 4) {
  return parseFloat(formatUnits(BigInt(amount), decimals))
    .toFixed(precision)
    .replace(/\.?0+$/, '') // remove last 0 xx.xx0000 => xx.xx
}

type TokenCardProps = {
  token: ERC20TokenBalance
}

const ERC20_LOGO_SIZE = 86 // px
const ERC20_CARD_SIZE = 200 // px

function TokenCard({ token }: TokenCardProps) {
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

      {/* //TODO: show contract address with a link to the blockexplorer */}

      <CardContent>
        <Typography variant="h6" align="center">
          {token.name || 'ERC20 Token'}
        </Typography>

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
