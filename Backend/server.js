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

const fs = require('fs');
const path = require('path');

// Cloudinary Configuration (use if credentials provided)
let useCloudinary = false;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  useCloudinary = true;
}

// Configure multer storage. Prefer Cloudinary when configured, otherwise fall back to local disk storage.
let upload;
if (useCloudinary) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'shoe-shop',
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
  });
  upload = multer({ storage: storage });
} else {
  // ensure upload dir exists
  const uploadDir = path.join(__dirname, 'public', 'uploads');
  try { fs.mkdirSync(uploadDir, { recursive: true }); } catch (e) { /* ignore */ }
  const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, uploadDir); },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`);
    }
  });
  upload = multer({ storage: diskStorage, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB limit
  // serve uploads statically
  app.use('/uploads', express.static(uploadDir));
}

// Middleware
// Configure CORS to allow the frontend origin. If FRONTEND_URL is not set, allow any origin
// (use a permissive fallback to support preview URLs and remote previews).
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL : function (origin, callback) { callback(null, true); },
  credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
// Address and payment sub-schemas stored on the user document
const addressSchema = new mongoose.Schema({
  type: { type: String, enum: ['Home','Work','Other'], default: 'Home' },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true, default: 'USA' },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const paymentMethodSchema = new mongoose.Schema({
  type: { type: String, enum: ['Visa','Mastercard','Amex','Other'], default: 'Visa' },
  last4: { type: String, required: true },
  expiry: { type: String, required: true },
  providerId: { type: String, default: '' }, // token/id from payment provider if applicable
  isDefault: { type: Boolean, default: false }
}, { _id: true });

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
  createdAt: { type: Date, default: Date.now },
  addresses: { type: [addressSchema], default: [] },
  paymentMethods: { type: [paymentMethodSchema], default: [] },
  wishlist: { type: [mongoose.Schema.Types.ObjectId], ref: 'Shoe', default: [] }
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

// User update endpoint
app.put('/api/auth/update', protect, async (req, res) => {
  try {
    const { firstName, lastName, email, currentPassword, newPassword } = req.body;

    if (email && email !== req.user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ status: 'fail', message: 'Email already in use' });
    }

    if (currentPassword && newPassword) {
      const valid = await req.user.comparePassword(currentPassword);
      if (!valid) return res.status(401).json({ status: 'fail', message: 'Current password is incorrect' });
      req.user.password = newPassword;
    }

    if (firstName) req.user.firstName = firstName;
    if (lastName) req.user.lastName = lastName;
    if (email) req.user.email = email;

    await req.user.save();
    const userObj = req.user.toObject();
    delete userObj.password;
    res.status(200).json({ status: 'success', user: userObj });
  } catch (err) {
    console.error('Auth update error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update user' });
  }
});

// Avatar upload endpoint
app.post('/api/auth/avatar', protect, (req, res, next) => {
  upload.single('avatar')(req, res, async function (err) {
    if (err) {
      console.error('Multer error during avatar upload:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ status: 'fail', message: 'File too large. Max size is 2MB.' });
      }
      return res.status(400).json({ status: 'fail', message: err.message || 'File upload failed' });
    }

    try {
      console.log('Avatar upload request headers:', { host: req.get('host'), contentType: req.headers['content-type'] });
      console.log('Received file:', req.file);

      if (!req.file) {
        return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
      }

      // If Cloudinary used, multer-storage-cloudinary provides req.file.path
      if (useCloudinary && req.file.path) {
        req.user.avatar = req.file.path;
      } else if (req.file.filename) {
        // Disk storage: construct accessible URL
        const host = req.get('host');
        const proto = req.protocol;
        req.user.avatar = `${proto}://${host}/uploads/${req.file.filename}`;
      } else {
        console.error('Unexpected upload response, req.file:', req.file);
        return res.status(500).json({ status: 'error', message: 'Upload returned unexpected response' });
      }

      await req.user.save();
      const userObj = req.user.toObject();
      delete userObj.password;
      res.status(200).json({ status: 'success', user: userObj });
    } catch (err) {
      console.error('Avatar upload error:', err);
      res.status(500).json({ status: 'error', message: 'Failed to upload avatar' });
    }
  });
});

// Addresses API (CRUD)
app.get('/api/addresses', protect, (req, res) => {
  res.status(200).json({ status: 'success', data: { addresses: req.user.addresses || [] } });
});

app.post('/api/addresses', protect, async (req, res) => {
  try {
    const { type, street, city, state, zip, country, phone, isDefault } = req.body;
    if (!street || !city || !state || !zip || !phone) {
      return res.status(400).json({ status: 'fail', message: 'Missing required address fields' });
    }

    if (isDefault) {
      req.user.addresses.forEach(a => a.isDefault = false);
    }

    req.user.addresses.push({ type, street, city, state, zip, country, phone, isDefault: !!isDefault });
    await req.user.save();

    res.status(201).json({ status: 'success', data: { address: req.user.addresses[req.user.addresses.length - 1] } });
  } catch (err) {
    console.error('Add address error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to add address' });
  }
});

app.put('/api/addresses/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const addr = req.user.addresses.id(id);
    if (!addr) return res.status(404).json({ status: 'fail', message: 'Address not found' });

    const { type, street, city, state, zip, country, phone, isDefault } = req.body;
    if (isDefault) req.user.addresses.forEach(a => a.isDefault = false);

    if (type !== undefined) addr.type = type;
    if (street !== undefined) addr.street = street;
    if (city !== undefined) addr.city = city;
    if (state !== undefined) addr.state = state;
    if (zip !== undefined) addr.zip = zip;
    if (country !== undefined) addr.country = country;
    if (phone !== undefined) addr.phone = phone;
    if (isDefault !== undefined) addr.isDefault = isDefault;

    await req.user.save();
    res.status(200).json({ status: 'success', data: { address: addr } });
  } catch (err) {
    console.error('Update address error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update address' });
  }
});

app.delete('/api/addresses/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const addr = req.user.addresses.id(id);
    if (!addr) return res.status(404).json({ status: 'fail', message: 'Address not found' });

    addr.remove();
    await req.user.save();
    res.status(200).json({ status: 'success', message: 'Address removed' });
  } catch (err) {
    console.error('Delete address error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to delete address' });
  }
});

// Payment methods API
app.get('/api/payment-methods', protect, (req, res) => {
  res.status(200).json({ status: 'success', data: { paymentMethods: req.user.paymentMethods || [] } });
});

app.post('/api/payment-methods', protect, async (req, res) => {
  try {
    const { type, last4, expiry, providerId, isDefault } = req.body;
    if (!last4 || !expiry) return res.status(400).json({ status: 'fail', message: 'Missing card details' });

    if (isDefault) req.user.paymentMethods.forEach(p => p.isDefault = false);

    req.user.paymentMethods.push({ type, last4, expiry, providerId: providerId || '', isDefault: !!isDefault });
    await req.user.save();

    res.status(201).json({ status: 'success', data: { paymentMethod: req.user.paymentMethods[req.user.paymentMethods.length - 1] } });
  } catch (err) {
    console.error('Add payment error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to add payment method' });
  }
});

app.put('/api/payment-methods/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const pm = req.user.paymentMethods.id(id);
    if (!pm) return res.status(404).json({ status: 'fail', message: 'Payment method not found' });

    const { type, last4, expiry, providerId, isDefault } = req.body;
    if (isDefault) req.user.paymentMethods.forEach(p => p.isDefault = false);

    if (type !== undefined) pm.type = type;
    if (last4 !== undefined) pm.last4 = last4;
    if (expiry !== undefined) pm.expiry = expiry;
    if (providerId !== undefined) pm.providerId = providerId;
    if (isDefault !== undefined) pm.isDefault = isDefault;

    await req.user.save();
    res.status(200).json({ status: 'success', data: { paymentMethod: pm } });
  } catch (err) {
    console.error('Update payment error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update payment method' });
  }
});

app.delete('/api/payment-methods/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const pm = req.user.paymentMethods.id(id);
    if (!pm) return res.status(404).json({ status: 'fail', message: 'Payment method not found' });

    pm.remove();
    await req.user.save();
    res.status(200).json({ status: 'success', message: 'Payment method removed' });
  } catch (err) {
    console.error('Delete payment error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to delete payment method' });
  }
});

// Wishlist API
app.get('/api/wishlist', protect, async (req, res) => {
  try {
    const wishlistIds = req.user.wishlist || [];
    const shoes = await Shoe.find({ _id: { $in: wishlistIds } });
    res.status(200).json({ status: 'success', data: { wishlist: shoes } });
  } catch (err) {
    console.error('Fetch wishlist error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch wishlist' });
  }
});

app.post('/api/wishlist', protect, async (req, res) => {
  try {
    const { shoeId } = req.body;
    if (!isValidObjectId(shoeId)) return res.status(400).json({ status: 'fail', message: 'Invalid shoe id' });

    const shoe = await Shoe.findById(shoeId);
    if (!shoe) return res.status(404).json({ status: 'fail', message: 'Shoe not found' });

    if (!req.user.wishlist) req.user.wishlist = [];
    if (!req.user.wishlist.find(id => id.toString() === shoeId)) {
      req.user.wishlist.push(shoeId);
      await req.user.save();
    }

    res.status(200).json({ status: 'success', message: 'Added to wishlist' });
  } catch (err) {
    console.error('Add wishlist error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to add to wishlist' });
  }
});

app.delete('/api/wishlist/:shoeId', protect, async (req, res) => {
  try {
    const { shoeId } = req.params;
    req.user.wishlist = (req.user.wishlist || []).filter(id => id.toString() !== shoeId);
    await req.user.save();
    res.status(200).json({ status: 'success', message: 'Removed from wishlist' });
  } catch (err) {
    console.error('Remove wishlist error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to remove from wishlist' });
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
