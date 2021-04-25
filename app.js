const path = require('path')

const express = require('express')

const morgan = require('morgan')

const rateLimit = require('express-rate-limit')

const helmet = require('helmet')

const mongoSanitize = require('express-mongo-sanitize')

const xss = require('xss-clean')

const hpp = require('hpp')

const cookieParser = require('cookie-parser')

const tourRouter = require('./routes/tourRoutes')

const userRouter = require('./routes/userRoutes')

const reviewRouter = require('./routes/reviewRoutes')

const viewRouter = require('./routes/viewRoutes')

const AppError = require('./utils/appError')

const globalErrorHandler = require('./controllers/errorController')

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
// 1. MIDDLE_WARES

//Serving static files
app.use(express.static(path.join(__dirname, 'public')))

//Set security HTTP headers
app.use(helmet())

//Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

//Limit Requests from Same API
const limiter = rateLimit({
  max: 100,
  windowMs: 3600 * 1000,
  message: 'Too many requests from this IP!',
})
app.use('/api', limiter)

//Body parser, reading data from body to req.body
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

//Data Sanitization against NoSql query injection
app.use(mongoSanitize())

//Data Sanitization against
app.use(xss())

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price'],
  })
)

//Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  // console.log(req.headers);
  //console.log(req.cookies)
  next()
})

//2. ROUTE HANDLERS

// 3. ROUTES
//app.get('/api/v1/tours', getAllTours)

//app.get('/api/v1/tours/:id', getTour)

//app.post('/api/v1/tours', createTour)

//app.patch('/api/v1/tours/:id', updateTour)

//app.delete('/api/v1/tours/:id', deleteTour)

app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

app.all('*', (req, res, next) => {
  console.log('No URL Found')
  next(new AppError(404, `Can't find ${req.originalUrl} in this server!`))
})

app.use(globalErrorHandler)

module.exports = app
