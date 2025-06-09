import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

type LoaderProps = {
  isLoading: boolean
  loadingText?: string
}

function Loader({ isLoading, loadingText }: LoaderProps) {
  if (!isLoading) {
    return null
  }

  return (
    <Box display={'flex'} justifyContent={'center'} flexDirection={'row'} flexGrow={1} padding={2}>
      <Box
        display={'flex'}
        justifyContent={'center'}
        flexDirection={'column'}
        gap={1}
        alignItems={'center'}
      >
        <CircularProgress />
        {loadingText && <Typography variant="body2">{loadingText}</Typography>}
      </Box>
    </Box>
  )
}

export default Loader
