const express = require('express');
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');
const reviewRouter = require('./reviewRoutes');

const tourRouter = express.Router();

tourRouter
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect,
    authController.restrictTo('admin', 'lead-guide'),tourController.createTour);

tourRouter
  .route('/tours-within/:distance/center/:latlang/unit/:unit')
  .get(tourController.getToursWithin)

tourRouter
  .route('/distances/:latlong/unit/:unit')
  .get(tourController.getDistances)

tourRouter
  .route('/:id')
  .get(tourController.getOneTour)
  .patch(authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

tourRouter.use('/:tourId/reviews',reviewRouter);

module.exports = tourRouter;
