const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .paginate();
  const tours = await features.query;

  res.status(201).json({
    status: 'success',
    count: tours.length,
    data: {
      tours,
    },
  });
});

exports.getOneTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppError('No tour with this ID', 404));
  }
  res.status(201).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedTour) {
    return next(new AppError('No tour with this ID', 404));
  }
  res.status(201).json({
    status: 'success',
    data: {
      tour: updatedTour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const deletedTour = await Tour.deleteOne({ _id: req.params.id });
  if (!deletedTour) {
    return next(new AppError('No tour with this ID', 404));
  }
  res.status(201).json({
    status: 'success',
    data: {
      tour: deletedTour,
    },
  });
});
