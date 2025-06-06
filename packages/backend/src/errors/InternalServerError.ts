import { StatusCodes } from 'http-status-codes'

import ServerError, { ErrorDetails } from './ServerError'

class InternalServerError extends ServerError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, details)
  }
}

export default InternalServerError
