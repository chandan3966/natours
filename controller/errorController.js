const AppError = require('../utils/appError');

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};

const handleJWTError = (err, req, res) =>
  new AppError('Invalid Token please login in again!', 401);

const handleJWTExpiredError = (err, req, res) =>
  new AppError('Token expired please login again and try!', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError(error, req, res);
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError(error, req, res);
    }

    sendErrorProd(error, res);
  } else {
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};
