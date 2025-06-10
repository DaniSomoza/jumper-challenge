import { mainnet } from '../chains/chains'

export function createTestSiweMessagePayload(chainId = mainnet.chainId) {
  const address = '0xB557916Bf4d38452048bA0d7f784a7F2421263c6'
  const domain = 'localhost:3000'
  const issuedAt = '2025-06-05T18:28:09.694Z'
  const nonce = 'Qj80Vmv0reIIcIDok'
  const statement = 'Sign in to Jumper Code Challenge.'
  const uri = 'http://localhost:3000'
  const version = '1'

  const nonceSigned =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IlFqODBWbXYwcmVJSWNJRG9rIiwiYWRkcmVzcyI6IjB4QjU1NzkxNkJmNGQzODQ1MjA0OGJBMGQ3Zjc4NGE3RjI0MjEyNjNjNiIsImp3dFR5cGUiOiJub25jZSIsImlhdCI6MTc0OTE0ODA4OSwiZXhwIjoxNzQ5MTQ4MjA5fQ.RJIhXGrhVXLSS2z8yD-DO3jxtIp7r7xm7udN6EQacKY'
  const signature =
    '0x5edf6c59527a2f3e1a435ef1ff93ed965692351cf82e342fac7fb6a475f408e85a9288ea0d65bb18f18c885ae8854556c4f5595f8e646304511e0a8ba10301a31b'

  const siweMessageData = {
    address,
    chainId,
    domain,
    issuedAt,
    nonce,
    statement,
    uri,
    version
  }

  return {
    siweMessageData,
    nonceSigned,
    signature,
    fields: {
      address,
      chainId,
      domain,
      issuedAt,
      nonce,
      statement,
      uri,
      version
    }
  }
}
