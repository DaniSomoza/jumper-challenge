export type ErrorDetails = Record<string, any>;

export type BodyErrorResponse = {
  error: string;
  details: ErrorDetails;
};

class ServerError extends Error {
  details: ErrorDetails;
  code: number;

  constructor(message: string, details: ErrorDetails = {}, code: number) {
    super(message);

    this.name = "ServerError";
    this.details = details;
    this.code = code;
  }

  toBodyResponse(): BodyErrorResponse {
    return {
      error: this.message,
      details: this.details,
    };
  }
}

export default ServerError;
