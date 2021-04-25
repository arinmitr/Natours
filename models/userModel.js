const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user should have a name'],
  },
  email: {
    type: String,
    required: [true, 'A user should have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Provide a valid mail'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password needed'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password needed'],
    minlength: 8,
    validate: {
      validator: function (el) {
        return el === this.password
      },
      message: 'Password Mismatch',
    },
  },
  passwordChanged: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
})

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } })
  next()
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  this.password = await bcrypt.hash(this.password, 12)
  this.passwordConfirm = undefined
  next()
})

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) next()

  this.passwordChanged = Date.now() - 5000
  next()
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.passwordChangedAfter = function (JWTTimeStamp) {
  if (this.passwordChanged) {
    const changedTimeStamp = parseInt(this.passwordChanged.getTime() / 1000, 10)

    return JWTTimeStamp < changedTimeStamp
  }

  return false
}

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000
  //console.log({ resetToken }, this.passwordResetToken)
  return resetToken
}
const User = mongoose.model('User', userSchema)

module.exports = User
