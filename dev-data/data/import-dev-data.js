const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASS,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log('Connection Success');

    const tours = JSON.parse(
      fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'),
    );
    const users = JSON.parse(
      fs.readFileSync(`${__dirname}/users.json`, 'utf-8'),
    );
    const reviews = JSON.parse(
      fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
    );

    const importData = async () => {
      try {
        await Tour.create(tours);
        await User.create(users,{validateBeforeSave: false});
        await Review.create(reviews);
        console.log('Data successfully loaded!');
      } catch (err) {
        console.log(err);
      }
    };

    const deleteData = async () => {
      try {
        await Tour.deleteMany().maxTimeMS(30000);
        await User.deleteMany().maxTimeMS(30000);
        await Review.deleteMany().maxTimeMS(30000);
        console.log('Data successfully Deleted!');
      } catch (err) {
        console.log(err);
      }
    };

    if (process.argv[2] === '--import') {
      importData();
    } else if (process.argv[2] === '--delete') {
      deleteData();
    }
  });
