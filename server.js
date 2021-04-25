const dotenv = require('dotenv')
const mongoose = require('mongoose')

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message)
  console.log('Uncaught Exception. Shutting Down!')
  process.exit(1)
})

dotenv.config({ path: './config.env' })
const app = require('./app')

const port = process.env.PORT || 3000
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connected')
  })

const server = app.listen(port, () => {
  console.log(`App running on Port ${port}...`)
})

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message)
  console.log('Unhandled Rejection. Shutting Down!')
  server.close(() => {
    process.exit(1)
  })
})
