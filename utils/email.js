const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
  //Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  //Define the mail options
  const mailOptions = {
    from: 'User 1 <user1@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  //Actually send the mail
  await transporter.sendMail(mailOptions)
}

module.exports = sendEmail
