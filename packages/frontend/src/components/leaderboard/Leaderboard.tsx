import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import { useQuery } from '@tanstack/react-query'

import { getLeaderboard, type LeaderboardType } from '../../http/leaderboardEndpoints'
import { useBalances } from '../../store/BalancesContext'
import AddressLabel from '../address-label/AddressLabel'
import { useAuthorization } from '../../store/AuthorizationContext'
import Loader from '../loader/Loader'

const emojis = ['🥇', '🥈', '🥉']

function Leaderboard() {
  const { chain } = useAuthorization()
  const { balances, isBalancesLoading } = useBalances()

  const { data: leaderboard = [], isLoading, isError } = useLeaderboard(!!balances)

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Box display="flex" justifyContent="center" mb={4}>
        <Typography variant="h4" component="h1" color="primary">
          🏆 Leaderboard
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" align="center" mb={3}>
        You earn 3 points for signing in on mainnet, 2 on L2s, and 1 point on testnets like Sepolia.
      </Typography>

      <Box display="flex" justifyContent="center" alignItems={'center'}>
        <TableContainer
          component={Paper}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 'initial'
          }}
        >
          {isLoading || isBalancesLoading ? (
            <Box padding={1}>
              <Loader isLoading loadingText="Loading leaderboard data..." />
            </Box>
          ) : isError ? (
            <Box padding={2}>
              <Typography>Error fetching leaderboard data</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Position</TableCell>
                  <TableCell align="center">Account</TableCell>
                  <TableCell align="center">Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboard.map(({ address, totalPoints }, index) => {
                  const showEmogis = index < 3

                  return (
                    <TableRow key={address}>
                      <TableCell align="center">
                        {showEmogis ? `${emojis[index]}` : `${index + 1}º`}
                      </TableCell>
                      <TableCell align="center">
                        <AddressLabel address={address} chain={chain!} />
                      </TableCell>
                      <TableCell align="center">{totalPoints}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Box>
    </Container>
  )
}

export default Leaderboard

const useLeaderboard = (enabled: boolean) => {
  return useQuery<LeaderboardType>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const leaderboard = await getLeaderboard()
      return leaderboard
    },
    staleTime: 60_000, // cache: 1 min
    enabled,
    refetchOnWindowFocus: false
  })
}
