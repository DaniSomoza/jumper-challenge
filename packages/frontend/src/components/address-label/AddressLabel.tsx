import type { Chain } from 'wagmi/chains'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'

type AddressLabelProps = {
  address: string
  chain?: Chain
}

function AddressLabel({ address, chain }: AddressLabelProps) {
  const blockExplorer = chain?.blockExplorers?.default

  const link = `${blockExplorer?.url}/address/${address}`

  if (!blockExplorer?.url) {
    return (
      <Typography variant="body2" textAlign={'center'}>
        {getAddressLabel(address)}
      </Typography>
    )
  }

  return (
    <Link href={link} target="_blank" textAlign={'center'}>
      <Typography variant="body2">{getAddressLabel(address)}</Typography>
    </Link>
  )
}

export default AddressLabel

const ADDRESS_LENGTH = 42

function getAddressLabel(address: string) {
  const firstPart = address.slice(0, 6)
  const lastPart = address.slice(ADDRESS_LENGTH - 4)

  return `${firstPart}...${lastPart}`
}
