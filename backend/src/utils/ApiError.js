class ApiError extends Error {
  constructor(
    res = null,
    statusCode,
    message = "something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (res) {
      // Immediately send the response if a response object is provided
      res.status(statusCode).json({
        success: this.success,
        message: this.message,
        errors: this.errors,
      });
    } else {
      Error.captureStackTrace(this, this.constructor);
    }

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
