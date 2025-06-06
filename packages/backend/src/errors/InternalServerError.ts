import { StatusCodes } from "http-status-codes";

import ServerError, { ErrorDetails } from "./ServerError";

class InternalServerError extends ServerError {
  constructor(message: string, details: ErrorDetails) {
    super(message, details, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export default InternalServerError;
