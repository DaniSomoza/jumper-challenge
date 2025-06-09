import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

type LoaderProps = {
  isLoading: boolean
}

function Loader({ isLoading }: LoaderProps) {
  if (!isLoading) {
    return null
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CircularProgress />
    </Box>
  )
}

export default Loader
