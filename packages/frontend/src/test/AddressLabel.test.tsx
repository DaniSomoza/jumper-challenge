import { render, screen } from '@testing-library/react'
import { sepolia } from 'viem/chains'

import AddressLabel from '../components/address-label/AddressLabel'

const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'

describe('AddressLabel', () => {
  it('should display shortened address', () => {
    render(<AddressLabel address={address} chain={sepolia} />)

    expect(screen.getByText('0xB557...63c6')).toBeInTheDocument()
  })

  it('should render a link to the block explorer when available', () => {
    render(<AddressLabel address={address} chain={sepolia} />)

    const link = screen.getByRole('link')

    expect(link).toHaveAttribute('href', `https://sepolia.etherscan.io/address/${address}`)
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('should not render a link when no block explorer is provided', () => {
    const chainWithoutBlockExplorer = {
      ...sepolia,
      blockExplorers: undefined
    }

    render(<AddressLabel address={address} chain={chainWithoutBlockExplorer} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('should not render a link when no chain is provided', () => {
    render(<AddressLabel address={address} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
