import ServerError, { BodyErrorResponse } from './ServerError'
import InternalServerError from './InternalServerError'

type ErrorResponse = {
  code: number
  body: BodyErrorResponse
}

function handleErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof ServerError) {
    return {
      code: error.code,
      body: error.toBodyResponse()
    }
  }

  const internalServerError = new InternalServerError('Internal Server Error', {
    error
  })

  return {
    code: internalServerError.code,
    body: internalServerError.toBodyResponse()
  }
}

export default handleErrorResponse
