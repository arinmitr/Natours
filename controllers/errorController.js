// const AppError = require('./../utils/appError')

const handleCastErrorDB = (err, res) => {
  const message = `Invalid ${err.path} : ${err.value}`
  res.status(404).json({
    status: 'fail, id not found',
    message: message,
  })
}

const handleAssertErrorDB = (err, res) => {
  res.status(500).json({
    status: 'fail',
    message: `data type error : ${err.path}`,
  })
}

const handleValidationErrorDB = (err, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Invalid data sent',
    reason: err.message,
  })
}

const handleMongoErrorDB = (err, res) => {
  const key = { ...err.keyValue }
  //const message = `Duplicate Field: A tour already exists with ${key.name}`
  res.status(404).json({
    status: 'fail',
    message: `Duplicate Field: A tour already exists with Name: --${key.name}--`,
  })
}

const handleJWTError = (err, res) => {
  res.status(401).json({
    status: 'fail',
    message: 'Invalid token! Login to continue.',
  })
}

const handleJWTExpError = (err, res) => {
  res.status(401).json({
    status: 'fail',
    message: 'Your token has expired! Login again to continue.',
  })
}

const sendErrorDev = (err, res) => {
  //console.log(err)
  // console.log(err.name)
  // console.log(err.statusCode)
  // console.log(err.status)
  if (err.kind === 'ObjectID') {
    err.statusCode = 404
    res.status(err.statusCode).json({
      status: 'fail',
      reason: `Tour not found for ID ${err.value}`,
      stack: err.stack,
    })
  } else {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
    })
  }
}

module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const error = err.name
    console.log(error)
    if (error === 'CastError' && err.kind === 'ObjectId') {
      handleCastErrorDB(err, res)
    } else if (error === 'CastError' && err.kind !== 'ObjectId') {
      handleAssertErrorDB(err, res)
    } else if (error === 'ValidationError') {
      handleValidationErrorDB(err, res)
    } else if (error === 'MongoError') {
      handleMongoErrorDB(err, res)
    } else if (error === 'JsonWebTokenError') {
      handleJWTError(err, res)
    } else if (error === 'TokenExpiredError') {
      handleJWTExpError(err, res)
    } else {
      res.status(404).json({
        status: 'unknown error',
        message: 'no idea',
      })
    }
  } else if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res)
  }
}
