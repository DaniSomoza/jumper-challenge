import { StatusCodes } from 'http-status-codes'

import ServerError, { ErrorDetails } from './ServerError'

class BadRequestError extends ServerError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, StatusCodes.BAD_REQUEST, details)
  }
}

export default BadRequestError
