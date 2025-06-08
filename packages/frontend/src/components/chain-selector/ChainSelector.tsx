import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import Select, { type SelectChangeEvent } from '@mui/material/Select'

import chains from '../../chains/chains'

function ChainSelector() {
  const { switchChain, isPending } = useSwitchChain()

  const chainId = useChainId()

  const account = useAccount()

  // TODO: isLoading?

  // TODO: create chain label component

  // TODO: Incompatible chain detected!

  const handleChange = (event: SelectChangeEvent<number>) => {
    const chainId = Number(event.target.value)

    // TODO: if user have a valid session => sign in again in this chain

    if (switchChain && chainId) {
      switchChain({ chainId })
    }
  }

  return (
    <FormControl sx={{ ml: 2, minWidth: 120, textAlign: 'center' }}>
      <Select
        value={account.chainId || chainId}
        onChange={handleChange}
        disabled={isPending}
        input={<CustomInput />}
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
