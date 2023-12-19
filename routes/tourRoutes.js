const express = require('express');
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');

const tourRouter = express.Router();

tourRouter
  .route('/')
  .get(tourController.getAllTours)
  .post(
    tourController.createTour,
  );

tourRouter
  .route('/:id')
  .get(tourController.getOneTour)
  .patch(tourController.updateTour)
  .delete(authController.protect ,authController.restrictTo('admin','lead-guide') ,tourController.deleteTour);

module.exports = tourRouter;
