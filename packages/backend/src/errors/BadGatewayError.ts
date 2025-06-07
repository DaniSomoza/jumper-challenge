import { StatusCodes } from 'http-status-codes'

import ServerError, { ErrorDetails } from './ServerError'

class BadGatewayError extends ServerError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, StatusCodes.BAD_GATEWAY, details)
  }
}

export default BadGatewayError
