const express = require('express');
const viewController = require('../controller/viewController');
const authController = require('../controller/authController');

const viewRouter = express.Router();

viewRouter.use(authController.isLoggedIn);

viewRouter.get('/', authController.isLoggedIn, viewController.getOverview);
viewRouter.get(
  '/tour/:slug',
  authController.isLoggedIn,
  viewController.getTour,
);
viewRouter.get('/login', authController.isLoggedIn, viewController.showLogin);
viewRouter.get('/me', authController.protect, viewController.getAccount);

viewRouter.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData,
);

module.exports = viewRouter;
