const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { promisify } = require('util')
const sendEmail = require('./../utils/email')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const { now } = require('mongoose')

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

const sendCreateToken = (user, statusCode, res) => {
  const token = signToken(user._id)

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600 * 1000),
    httpOnly: true,
  }

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

  res.cookie('jwt', token, cookieOptions)

  res.password = undefined

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  })
}

exports.signUp = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'name', 'email', 'password', 'passwordConfirm')
  const newUser = await User.create(filteredBody)

  sendCreateToken(newUser, 201, res)
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  //If email & password is provided
  if (!email || !password) {
    return next(new AppError(400, 'Provide email & pass'))
  }

  //Check if user exists & password is correct
  const user = await User.findOne({ email: email }).select('+password')

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(401, 'Incorrect Email or Password'))
  }

  //If all ok, send token
  sendCreateToken(user, 200, res)
})

exports.logout = (req, res) => {
  res.cookie('jwt', 'logged-out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })
  res.status(200).json({
    status: 'success',
  })
}

exports.protect = catchAsync(async (req, res, next) => {
  //Get token Check if token exists
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return next(new AppError(401, 'You are not logged in! Please log in to get access'))
  }
  //Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  //Check if user still exist
  const freshUser = await User.findById(decoded.id)

  if (!freshUser) return next(new AppError(401, 'User belonging to the token no longer exist'))

  //Check if  user changed password after token was issued
  if (freshUser.passwordChangedAfter(decoded.iat)) {
    return next(new AppError(401, 'User changed password! Login again'))
  }
  //Grant access to protected route
  req.user = freshUser
  res.locals.user = freshUser
  next()
})

//Only for rendered pages
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //Verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)

      //Check if user still exist
      const freshUser = await User.findById(decoded.id)

      if (!freshUser) return next()

      //Check if  user changed password after token was issued
      if (freshUser.passwordChangedAfter(decoded.iat)) {
        return next()
      }
      //There is a logged in user
      res.locals.user = freshUser
      return next()
    } catch (err) {
      return next()
    }
  }
  next()
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Get User based on Posted email
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(new AppError(404, 'No user with this email'))
  }

  //Generate the random reset token
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  //Send it to users email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

  const message = `Forgot password? Send a patch request with your new password and passwordConfirm to ${resetURL}`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 mins)',
      message,
    })

    res.status(200).json({
      status: 'success',
      message: 'Reset link send to email',
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save({ validateBeforeSave: false })
    return next(new AppError(500, 'Error sending mail. Try again later'))
  }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on token
  const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

  const user = await User.findOne({ passwordResetToken: hashToken, passwordResetExpires: { $gt: Date.now() } })

  //If token has no expired, and there is a user, set new password
  if (!user) {
    return next(new AppError(400, 'Token is invalid or has Expired!'))
  }

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save({ validateBeforeSave: true })

  //Update passwordChanged property for the user
  //Log in the user, send JWT
  sendCreateToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  //Get user from collection
  const user = await User.findById(req.user.id).select('+password')
  //Check if posted password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    next(new AppError(401, 'Wrong Password'))
  }
  //Update the password
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm

  await user.save()
  //Log the user in
  sendCreateToken(user, 200, res)
})

exports.RestrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError(403, 'Permission denied for this action!'))
  }
  next()
}
