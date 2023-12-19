const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User must have name'],
    },
    email: {
      type: String,
      required: [true, 'A User must have email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide valid email.'],
    },
    photo: {
      type: String,
    },
    password: {
      type: String,
      required: [true, 'User must have valid password'],
      minlength: 8,
      select: true,
    },
    confirmpassword: {
      type: String,
      required: [true, 'User must have valid confirm password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        messsage: 'Paswords are not same',
      },
    },
    createdAt: { type: Date, default: Date.now() },
    slug: String,
    passwordChangedAt: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmpassword = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordCheck = function(JWTTimestamp){
  if(this.passwordChangedAt){
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000, 10);
    
    return JWTTimestamp < changedTimeStamp;
  }
  
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
