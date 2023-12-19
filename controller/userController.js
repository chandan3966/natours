const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getAllusers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getOneUser = (req, res) => {
  const { id } = req.params;
  const item = users.find((item) => item._id === id);

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  res.status(200).json({
    status: 'success',
    data: {
      item,
    },
  });
};

exports.createUser = (req, res) => {
  const newId = uuidv4();
  const newItem = { _id: newId, ...req.body };
  users.push(newItem);

  fs.writeFileSync(
    `${__dirname}/../dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          user: newItem,
        },
      });
    },
  );

  res.status(201).json({
    status: 'success',
    data: {
      user: newItem,
    },
  });
};

exports.updateUser = (req, res) => {
  const item = users.find((item) => item._id === req.params.id);
  if (!item) {
    return res.status(404).json({
      status: 'failed',
      message: 'Invalid Id',
    });
  }
  const { id } = req.params;
  const index = users.findIndex((item) => item._id === id);
  const updatedItem = { _id: id, ...req.body };

  if (index !== -1) {
    // Update the item at the found index with the updated data
    users[index] = { ...users[index], ...updatedItem };
    fs.writeFileSync(
      `${__dirname}/../dev-data/data/users.json`,
      JSON.stringify(users),
      (err) => {
        res.status(201).json({
          status: 'success',
          data: {
            user: newItem,
          },
        });
      },
    );
    res.status(200).json({
      status: 'success',
      data: {
        user: users[index],
      },
    }); // Return the updated item
  } else {
    res.status(404).json({ error: 'Item not found' }); // Handle the case when the item is not found
  }
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // check iff pass and conffirm password are provided in body
  if (req.body.password || req.body.confirmpassword) {
    return next(
      new AppError(
        'This route is not for password update! please use update-password',
        400,
      ),
    );
  }

  //get user
  const filterBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.deleteUser = (req, res) => {
  const item = users.find((item) => item._id === req.params.id);
  if (!item) {
    return res.status(404).json({
      status: 'failed',
      message: 'Invalid Id',
    });
  }
  const { id } = req.params;
  const index = users.findIndex((item) => item._id === id);

  if (index !== -1) {
    // Remove the item at the found index
    users.splice(index, 1);
    fs.writeFileSync(
      `${__dirname}/../dev-data/data/users.json`,
      JSON.stringify(users),
      (err) => {
        res.status(201).json({
          status: 'success',
          data: {
            user: newItem,
          },
        });
      },
    );
    res.status(204).json({
      status: 'success',
      message: 'deleted',
    }); // Return a 204 No Content response
  } else {
    res.status(404).json({ error: 'Item not found' }); // Handle the case when the item is not found
  }
};
