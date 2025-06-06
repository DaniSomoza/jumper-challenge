import { StatusCodes } from 'http-status-codes'

import ServerError, { ErrorDetails } from './ServerError'

class UnauthorizedError extends ServerError {
  constructor(message: string, details: ErrorDetails) {
    super(message, details, StatusCodes.UNAUTHORIZED)
  }
}

export default UnauthorizedError
