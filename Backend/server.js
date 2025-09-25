require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shoe-shop',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 50 },
  lastName: { type: String, required: true, trim: true, maxlength: 50 },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  avatar: { type: String, default: 'https://www.gravatar.com/avatar/?d=mp' },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

const shoeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true, enum: ['nike', 'adidas', 'reebok', 'puma', 'other'] },
  price: { type: Number, required: true },
  description: { type: String },
  images: [{ type: String }],
  colors: [{ type: String }],
  sizes: [{ type: Number }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  stock: { type: Number, default: 0 },
  isNewArrival: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Shoe = mongoose.model('Shoe', shoeSchema);

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    shoeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shoe', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String },
    size: { type: Number },
    color: { type: String }
  }],
  shippingInfo: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true }
  },
  paymentMethod: { type: String, required: true, enum: ['cod', 'upi'] },
  paymentStatus: { type: String, required: true, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

const Order = mongoose.model('Order', orderSchema);

// JWT Functions
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

// Auth Middleware
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'You are not logged in' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({ status: 'fail', message: 'User no longer exists' });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({ status: 'fail', message: 'Invalid token' });
  }
};

const adminCheck = async (req, res, next) => {
  if (req.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ status: 'fail', message: 'Unauthorized. Admin access required.' });
  }
  next();
};

// Validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ status: 'fail', message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'Email already in use' });
    }

    const newUser = await User.create({ firstName, lastName, email, password });
    const token = signToken(newUser._id);

    newUser.password = undefined;

    res.status(201).json({ status: 'success', token, user: newUser });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ status: 'error', message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Email and password required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    const token = signToken(user._id);

    user.password = undefined;

    res.status(200).json({ status: 'success', token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ status: 'error', message: 'Login failed' });
  }
});

app.get('/api/auth/me', protect, (req, res) => {
  res.status(200).json({ status: 'success', user: req.user });
});

// Shoe Routes
app.get('/api/shoes', async (req, res) => {
  try {
    const { brand, minPrice, maxPrice, sort, search, featured, newArrivals } = req.query;

    let query = {};

    if (brand && brand !== 'all') query.brand = brand;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (featured === 'true') query.featured = true;
    if (newArrivals === 'true') query.isNewArrival = true;

    let sortOption = {};
    switch (sort) {
      case 'price-low': sortOption = { price: 1 }; break;
      case 'price-high': sortOption = { price: -1 }; break;
      case 'rating': sortOption = { rating: -1 }; break;
      case 'newest': sortOption = { createdAt: -1 }; break;
      default: sortOption = { featured: -1, createdAt: -1 };
    }

    const shoes = await Shoe.find(query).sort(sortOption);
    res.status(200).json({ status: 'success', data: { shoes } });
  } catch (err) {
    console.error('Shoes fetch error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch shoes' });
  }
});

app.get('/api/shoes/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid shoe ID' });
    }
    const shoe = await Shoe.findById(req.params.id);
    if (!shoe) {
      return res.status(404).json({ status: 'fail', message: 'Shoe not found' });
    }
    res.status(200).json({ status: 'success', data: { shoe } });
  } catch (err) {
    console.error('Shoe fetch error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch shoe' });
  }
});

app.post('/api/shoes', protect, adminCheck, upload.array('images', 5), async (req, res) => {
  try {
    const { name, brand, price, description, colors, sizes, stock, isNewArrival, featured } = req.body;

    const shoe = await Shoe.create({
      name,
      brand,
      price,
      description,
      images: req.files?.map(file => file.path) || [],
      colors: colors ? JSON.parse(colors) : [],
      sizes: sizes ? JSON.parse(sizes) : [],
      stock,
      isNewArrival,
      featured
    });

    res.status(201).json({ status: 'success', data: { shoe } });
  } catch (err) {
    console.error('Shoe creation error:', err);
    res.status(400).json({ status: 'error', message: `Failed to create shoe: ${err.message}` });
  }
});


// Order Routes
app.post('/api/orders', protect, async (req, res) => {
  try {
    const { items, total, shippingInfo, paymentMethod, paymentStatus = 'pending' } = req.body;

    // Validation
    if (!items || !items.length) {
      return res.status(400).json({ status: 'fail', message: 'Cannot place an empty order' });
    }

    if (!total || total <= 0) {
      return res.status(400).json({ status: 'fail', message: 'Invalid order total' });
    }

    if (!shippingInfo || !shippingInfo.name || !shippingInfo.address || !shippingInfo.city ||
      !shippingInfo.state || !shippingInfo.zip || !shippingInfo.country || !shippingInfo.phone) {
      return res.status(400).json({ status: 'fail', message: 'Incomplete shipping information' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ status: 'fail', message: 'Payment method is required' });
    }

    // Verify products exist
    const productIds = items.map(item => item.shoeId);
    const products = await Shoe.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      return res.status(400).json({ status: 'fail', message: 'Some products not found' });
    }

    // Prepare order items
    const orderItems = items.map(item => {
      const product = products.find(p => p._id.toString() === item.shoeId);
      return {
        shoeId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: item.image || product.images?.[0] || '',
        size: item.size || null,
        color: item.color || null
      };
    });

    // Calculate total including COD fee if applicable
    const finalTotal = paymentMethod === 'cod' ? total + 50 : total;

    // Create the order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingInfo,
      paymentMethod,
      paymentStatus,
      total: finalTotal,
      status: 'pending'
    });

    
    if (paymentMethod !== 'cod' && paymentStatus === 'completed') {
      await Promise.all(items.map(item =>
        Shoe.findByIdAndUpdate(item.shoeId, { $inc: { stock: -item.quantity } })
      ));
    }

    res.status(201).json({ status: 'success', data: { order } });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create order',
      error: err.message
    });
  }
});

app.get('/api/orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName email');

    res.status(200).json({
      status: 'success',
      data: { orders }
    });
  } catch (err) {
    console.error('Orders fetch error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch orders' });
  }
});

// New endpoint to fetch all orders without authentication
app.get('/api/orders/all', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName email');
    res.status(200).json({ status: 'success', data: { orders } });
  } catch (err) {
    console.error('All orders fetch error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch all orders' });
  }
});

app.get('/api/orders/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid order ID' });
    }

    const order = await Order.findOne({
      _id: id,
      user: req.user._id
    }).populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'Order not found or unauthorized'
      });
    }

    res.status(200).json({ status: 'success', data: { order } });
  } catch (err) {
    console.error('Order fetch error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch order' });
  }
});

app.patch('/api/orders/:id/verify-payment', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid order ID' });
    }

    if (!paymentStatus || !['completed', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid payment status' });
    }

    const order = await Order.findOne({ _id: id, user: req.user._id });

    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found or unauthorized' });
    }

    if (order.paymentStatus === 'pending') {
      order.paymentStatus = paymentStatus;

      if (paymentStatus === 'completed') {
        for (const item of order.items) {
          await Shoe.findByIdAndUpdate(item.shoeId, { $inc: { stock: -item.quantity } });
        }
        order.status = 'processing';
      } else {
        order.status = 'cancelled';
      }

      await order.save();
    } else {
      return res.status(400).json({
        status: 'fail',
        message: 'Payment status cannot be updated from current state'
      });
    }

    res.status(200).json({ status: 'success', data: { order } });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update payment status'
    });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// Root route for preview/proxy
app.get('/', (req, res) => {
  res.send('<!doctype html><html><head><meta charset="utf-8"><title>Backend</title></head><body><h2>Backend API is running</h2><p>Try <a href="/api/health">/api/health</a> or API endpoints under /api</p></body></html>');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
