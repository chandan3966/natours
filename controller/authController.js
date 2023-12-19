const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

//creating a JWT token
const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES_COOKIE * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
  });
};

//singup a user
exports.createUser = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmpassword: req.body.confirmpassword,
    photo: req.body.photo,
  });
  createSendToken(newUser, 201, res);
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
  createSendToken(user, 201, res);
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

  req.user = freshuser;
  next();
});

//protect api based on roles
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Access denied. You do not have the required role.', 403),
      );
    }
    next();
  };

//forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('No user found with email', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/user/reset-password/${resetToken}`;
  const message = `Forgot your password? Submit a patch request with your new password and password confirm
   to ${resetUrl}.\n If you remember your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token. (Valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email! please try again later',
        500,
      ),
    );
  }
});

//reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1. Get user based on toke

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  user.password = req.body.password;
  user.confirmpassword = req.body.confirmpassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassowrd = catchAsync(async (req, res, next) => {
  //1.get user from DB
  const user = await User.findById(req.user.id).select('+password');

  //2.chec if posted user is correct
  if (!(await user.correctPassword(req.body.passwordcurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  //3.if so, update user

  user.password = req.body.password;
  user.confirmpassword = req.body.confirmpassword;

  await user.save();
  //4. log user in, send JWT
  createSendToken(user, 200, res);
});
