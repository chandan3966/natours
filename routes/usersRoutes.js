const express = require('express');
const usersController = require('../controller/userController');
const authController = require('../controller/authController');

const userRouter = express.Router();

userRouter
  .route('/signup')
  .post(authController.createUser);

  userRouter
  .route('/login')
  .post(authController.loginUser);

userRouter
  .route('/')
  .get(authController.protect, usersController.getAllusers)
  .post(usersController.createUser);

userRouter
  .route('/:id')
  .get(usersController.getOneUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = userRouter;
