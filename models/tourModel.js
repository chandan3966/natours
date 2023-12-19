const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: {
      type: String,
      required: [true, 'A Tour must have name'],
      validate: [validator.isAlpha, 'Name should only have alphabets'],
    },
    duration: { type: Number, required: [true, 'A Tour must have duration'] },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have difficulty'],
    },
    ratingsAverage: { type: Number, default: 4.5 },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tour must have price'] },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A Tour must have summary'],
    },
    description: { type: String, trim: true },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have image cover'],
    },
    images: { type: [String] },
    startDates: { type: [String] },
    createdAt: { type: Date, default: Date.now() },
    slug: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//virtuals
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//before create a record
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
//after create a record
tourSchema.post('save', function (doc, next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
