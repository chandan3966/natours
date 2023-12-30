const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour must have name'],
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
    ratingsAverage: { type: Number, default: 4.5,set: val=> Math.round(val * 10)/10 },
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
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref:'User'
      }
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.index({startLocation: '2dsphere'});

//virtuals
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//populate reviews
tourSchema.virtual('reviews',{
  ref:'Review',
  foreignField:'tour',
  localField:'_id'
})

//before create a record
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function(next){
  this.populate({
    path:'guides',
    select:'-__v-id'
  });

  next();
})

//after create a record
tourSchema.post('save', function (doc, next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function(next){
//   const guidesPromises =  this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// })

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
