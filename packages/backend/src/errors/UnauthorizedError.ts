import { StatusCodes } from 'http-status-codes'

import ServerError, { ErrorDetails } from './ServerError'

class UnauthorizedError extends ServerError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, StatusCodes.UNAUTHORIZED, details)
  }
}

export default UnauthorizedError
