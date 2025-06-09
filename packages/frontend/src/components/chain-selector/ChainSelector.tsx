import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import Select, { type SelectChangeEvent } from '@mui/material/Select'

import chains from '../../chains/chains'
import { useAuthorization } from '../../store/AuthorizationContext'

function ChainSelector() {
  const { chainId, switchChain, isWalletConnected, isSwitchChainLoading } = useAuthorization()

  const showChainSelector = isWalletConnected && chainId

  const handleChange = (event: SelectChangeEvent<number>) => {
    const chainId = Number(event.target.value)

    if (switchChain && chainId) {
      switchChain({ chainId })
    }
  }

  if (!showChainSelector) {
    return null
  }

  return (
    <FormControl sx={{ ml: 2, minWidth: 120, textAlign: 'center' }}>
      <Select
        value={chainId}
        onChange={handleChange}
        input={<CustomInput />}
        disabled={isSwitchChainLoading}
      >
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
