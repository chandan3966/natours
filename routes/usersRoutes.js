const express = require('express');
const usersController = require('../controller/userController');
const authController = require('../controller/authController');

const userRouter = express.Router();

userRouter.route('/signup').post(authController.createUser);

userRouter.route('/login').post(authController.loginUser);

userRouter.route('/forgot-password').post(authController.forgotPassword);

userRouter.route('/reset-password/:id').patch(authController.resetPassword);

userRouter.route('/updateMe').patch(authController.protect, usersController.updateMe);
userRouter.route('/deleteMe').delete(authController.protect, usersController.deleteMe);


userRouter
  .route('/update-password')
  .patch(authController.protect, authController.updatePassowrd);

userRouter
  .route('/')
  .get(authController.protect, usersController.getAllusers)
  .post(authController.protect ,authController.restrictTo('admin','lead-guide') ,usersController.createUser);

userRouter
  .route('/:id')
  .get(authController.protect ,usersController.getOneUser)
  .patch(authController.protect ,authController.restrictTo('admin','lead-guide') ,usersController.updateUser)
  .delete(authController.protect ,authController.restrictTo('admin','lead-guide') ,usersController.deleteUser);

module.exports = userRouter;
