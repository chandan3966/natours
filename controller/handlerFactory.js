const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/APIFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No Document with this ID', 404));
    }
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedDoc) {
      return next(new AppError('No document with this ID', 404));
    }
    res.status(201).json({
      status: 'success',
      data: {
        data: updatedDoc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: newDoc,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError('No Document with this ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.getAll = (Model, popOption) =>
  catchAsync(async (req, res, next) => {
    let firstQuery = Model.find();
    if (popOption) firstQuery = firstQuery.populate(popOption);

    const features = new APIFeatures(firstQuery, req.query)
      .filter()
      .sort()
      .paginate();
    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      count: docs.length,
      data: {
        docs,
      },
    });
  });
