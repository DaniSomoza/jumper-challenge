import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'

import { type Balances } from '../../http/balancesEndpoints'
import Loader from '../loader/Loader'
import type { AxiosError } from 'axios'
import chains from '../../chains/chains'
import TokenCard from '../token-card/TokenCard'
import getErrorLabel from '../../errors/getErrorLabel'

type BalanceListProps = {
  balances?: Balances
  isLoading: boolean
  isBalancesError: boolean
  isBalancesFetching: boolean
  error?: AxiosError<{ error: string }> | null
}

function BalanceList({ balances, isLoading, isBalancesFetching, error }: BalanceListProps) {
  const showLoader = isLoading || isBalancesFetching

  const chain = chains.find((chain) => chain.id === balances?.chainId)

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

      {!showLoader && (
        <Typography mt={1} variant="caption">
          Your ERC20 Tokens in {chain?.name} via {balances?.provider.name}
        </Typography>
      )}

      <Paper variant="outlined">
        <Grid
          container
          spacing={2}
          padding={1}
          sx={{
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {showLoader ? (
            <Loader isLoading loadingText={'Loading balances...'} />
          ) : (
            <>
              {error ? (
                <div>Show error: {getErrorLabel(error)}</div>
              ) : (
                <>
                  {balances?.tokens.length === 0 ? (
                    <Typography padding={2}>0 ERC20 Tokens found in {chain?.name}...</Typography>
                  ) : (
                    <>
                      {balances?.tokens.map((token) => {
                        return <TokenCard token={token} key={token.address} chain={chain} />
                      })}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </Grid>
      </Paper>
    </Box>
  )
}

export default BalanceList
