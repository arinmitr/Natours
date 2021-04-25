class AppError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
    //console.log(this.statusCode)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'custom error'
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError
