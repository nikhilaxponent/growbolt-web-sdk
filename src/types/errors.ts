export class SDKError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "SDKError";
  }
}

export class ValidationError extends SDKError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class APIError extends SDKError {
  constructor(
    message: string,
    public status?: number,
    public data?: any,
  ) {
    super(message, "API_ERROR");
    this.name = "APIError";
  }
}

export class TimeoutError extends SDKError {
  constructor(message: string) {
    super(message, "TIMEOUT");
    this.name = "TimeoutError";
  }
}
