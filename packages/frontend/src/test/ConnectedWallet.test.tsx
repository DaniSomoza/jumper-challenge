import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

import ConnectedWallet from '../components/connected-wallet/ConnectedWallet'
import { sepolia } from 'viem/chains'

const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'

describe('ConnectedWallet', () => {
  it('should render wallet icon, address and logout button', () => {
    render(
      <ConnectedWallet address={address} chain={sepolia} logout={vi.fn()} isDisconnecting={false} />
    )

    // AddressLabel
    expect(screen.getByText('0xB557...63c6')).toBeInTheDocument()

    // Logout button
    expect(screen.getByLabelText('Disconnect Wallet')).toBeInTheDocument()
  })

  it('should call logout when logout button is clicked', () => {
    const logoutMock = vi.fn()

    render(
      <ConnectedWallet
        address={address}
        chain={sepolia}
        logout={logoutMock}
        isDisconnecting={false}
      />
    )

    const logoutButton = screen.getByLabelText('Disconnect Wallet')
    fireEvent.click(logoutButton)

    expect(logoutMock).toHaveBeenCalledTimes(1)
  })
})
