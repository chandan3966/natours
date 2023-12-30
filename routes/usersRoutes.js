const express = require('express');
const usersController = require('../controller/userController');
const authController = require('../controller/authController');

const userRouter = express.Router();

userRouter.route('/signup').post(authController.createUser);
userRouter.route('/login').post(authController.loginUser);
userRouter.route('/forgot-password').post(authController.forgotPassword);
userRouter.route('/reset-password/:id').patch(authController.resetPassword);
userRouter.route('/logout').get(authController.logoutUser);

userRouter.use(authController.protect);

userRouter
  .route('/updateMe')
  .patch(
    usersController.uploadUserPhoto,
    usersController.resizeUserPhoto,
    usersController.updateMe,
  );

userRouter.route('/deleteMe').delete(usersController.deleteMe);

userRouter
  .route('/getMe')
  .get(usersController.getMe, usersController.getOneUser);

userRouter.route('/updateMyPassword').patch(authController.updatePassowrd);

userRouter.route('/').get(usersController.getAllusers);

userRouter
  .route('/:id')
  .get(usersController.getOneUser)
  .patch(
    authController.restrictTo('admin', 'lead-guide'),
    usersController.updateUser,
  )
  .delete(
    authController.restrictTo('admin', 'lead-guide'),
    usersController.deleteUser,
  );

module.exports = userRouter;
