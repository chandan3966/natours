const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorController = require('./controller/errorController');

const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/usersRoutes');

// Middleware to parse JSON requests
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public`));
const loggerMiddleware = (req, res, next) => {
  console.log(`Request URL: ${req.originalUrl}`);
  next();
};

app.use(loggerMiddleware);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//route to handle all unidentified routes
app.all('*', (req,res,next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the webapp.`,404));
});

app.use(globalErrorController);

module.exports = app;
