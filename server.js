const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

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
  });


const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log("Unhandled Rejection! Shutting dowm !!")
  server.close(() => {
    process.exit(1);
  })
});

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log("Uncaught Rejection! Shutting dowm !!")
  server.close(() => {
    process.exit(1);
  })
});