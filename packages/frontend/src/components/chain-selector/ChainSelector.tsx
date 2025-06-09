import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import Select, { type SelectChangeEvent } from '@mui/material/Select'

import chains from '../../chains/chains'
import { useAuthorization } from '../../store/AuthorizationContext'

function ChainSelector() {
  const { chainId, switchChain, isWalletConnected } = useAuthorization()

  // TODO: create chain label component

  // TODO: Incompatible chain detected in the wallet!

  const handleChange = async (event: SelectChangeEvent<number>) => {
    const chainId = Number(event.target.value)

    if (switchChain) {
      switchChain({ chainId })
    }
  }

  if (!isWalletConnected || !chainId) {
    return null
  }

  return (
    <FormControl sx={{ ml: 2, minWidth: 120, textAlign: 'center' }}>
      <Select value={chainId} onChange={handleChange} input={<CustomInput />}>
        {chains.map((chain) => (
          <MenuItem key={chain.id} value={chain.id}>
            {chain.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default ChainSelector

const CustomInput = styled(OutlinedInput)(() => ({
  '& .MuiInputBase-input': {
    padding: '8px 8px 8px 12px'
  }
}))
