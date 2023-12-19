const AppError = require("../utils/appError");

const sendErrorDev = (err,res)=> {
  res.status(err.statusCode).json({
    status:err.status,
    error:err,
    message:err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err,res)=> {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};

const handleJWTError = (err,res)=> new AppError('Invalid Token please login in again!',401);

const handleJWTExpiredError = (err,res) => new AppError('Token expired please login again and try!', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err,res)
  } else if (process.env.NODE_ENV === 'production') {
    let error = {...err};

    if(error.name === 'JsonWebTokenError'){
      error = handleJWTError(error);
    }
    if(error.name === 'TokenExpiredError'){
      error = handleJWTExpiredError(error);
    }

    sendErrorProd(error,res);
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};
