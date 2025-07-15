const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    maxlength: [100, 'Email cannot exceed 100 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
    maxlength: [100, 'Password cannot exceed 100 characters']
  },
  birthDate: {
    type: Date,
    required: [true, 'Birth date is required'],
    validate: {
      validator: function(value) {
        // Ensure birth date is in the past
        return value < new Date();
      },
      message: 'Birth date must be in the past'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// Middleware to hash password before saving
UserSchema.pre('save', async function(next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost factor of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords for login
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Static method for user registration
UserSchema.statics.register = async function(userData) {
  // Destructure required fields
  const { firstName, lastName, email, password, confirmPassword, birthDate } = userData;

  // Validate required fields
  if (!firstName || !lastName || !email || !password || !confirmPassword || !birthDate) {
    throw new Error('All fields are required');
  }

  // Validate email format
  if (!validator.isEmail(email)) {
    throw new Error('Please provide a valid email');
  }

  // Validate password length
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  // Validate password match
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  // Validate birth date is valid date
  if (isNaN(new Date(birthDate).getTime())) {
    throw new Error('Invalid birth date');
  }

  // Check if user already exists
  const existingUser = await this.findOne({ email });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  // Create new user
  const user = await this.create({
    firstName,
    lastName,
    email,
    password, // Will be hashed by pre-save hook
    birthDate: new Date(birthDate)
  });

  // Convert to object and remove password before returning
  const userObject = user.toObject();
  delete userObject.password;

  return userObject;
};

// Static method to find user by email for login
UserSchema.statics.findByEmail = async function(email) {
  return await this.findOne({ email }).select('+password');
};

// Query middleware to filter out inactive users by default
UserSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;