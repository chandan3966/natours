const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const userRouter = require('./routes/usersRoutes');
const tourRouter = require('./routes/tourRoutes');
const globalErrorController = require('./controller/errorController');
const AppError = require('./utils/appError');

const app = express();

//secure http headers
app.use(helmet());

// Middleware to parse JSON requests
app.use(express.json());

//Data sanatization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitisation against XSS
app.use(xss());

//prevent parameter pollution
app.use(hpp());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//servving static files in project
app.use(express.static(`${__dirname}/public`));

const loggerMiddleware = (req, res, next) => {
  console.log(`Request URL: ${req.originalUrl}`);
  next();
};

app.use(loggerMiddleware);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//route to handle all unidentified routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the webapp.`, 404));
});

app.use(globalErrorController);

// Define a rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again in an 15 min',
});
app.use('/api', limiter);

module.exports = app;
