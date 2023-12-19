const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

//creating a JWT token
const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

//singup a user
exports.createUser = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmpassword: req.body.confirmpassword,
    photo: req.body.photo,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

//login a user
exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please enter email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  const token = signToken(user._id);
  res.status(201).json({
    status: 'success',
    token,
  });
});

//protect non loggedin users from using other API's
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //check if token is sent from request
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to use the API', 401),
    );
  }

  //check if the token is valid
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if user still exists
  const freshuser = await User.findOne({ _id: decoded.id });
  if (!freshuser) {
    return next(
      new AppError('The user invoked this token doesnot exist anymore.', 401),
    );
  }

  //check if user changed the password after generating the token
  if (freshuser.changedPasswordCheck(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please login again', 401),
    );
  }

  next();
});
