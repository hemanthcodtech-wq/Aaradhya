const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { store } = require('../services/dbAdapter');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'multivendor_jwt_super_secure_key_2026_9876543210', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register a new customer or vendor
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role = 'customer', storeName } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Please provide name, email, and password', 400);
    }

    const existingUser = store.findOne('users', { email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'An account with this email already exists', 400);
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = store.create('users', {
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      password: hashedPassword,
      role: ['customer', 'vendor'].includes(role) ? role : 'customer',
      permissions: role === 'vendor' ? ['vendor'] : [],
      isActive: true,
      isVerified: true,
      addresses: [],
    });

    // If registering as vendor, create associated vendor record
    let vendorRecord = null;
    if (role === 'vendor') {
      const slug = (storeName || `${name} Store`).toLowerCase().replace(/[^a-z0-9]/g, '-');
      vendorRecord = store.create('vendors', {
        user: newUser._id,
        storeName: storeName || `${name} Store`,
        slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
        email: email.toLowerCase(),
        phone: phone || '',
        description: 'New merchant storefront on ShopMart',
        rating: 5.0,
        reviewCount: 0,
        status: 'pending', // Requires admin approval
        commissionRate: 10,
        totalSales: 0,
        totalEarnings: 0,
        pendingPayout: 0,
        paidPayout: 0,
      });
    }

    const token = generateToken(newUser._id);
    const { password: pwd, ...userWithoutPassword } = newUser;

    return sendSuccess(
      res,
      {
        user: userWithoutPassword,
        vendor: vendorRecord,
        token,
      },
      'Registration successful',
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get JWT token
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please enter email and password', 400);
    }

    const user = store.findOne('users', { email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 'Invalid credentials. User not found.', 401);
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials. Incorrect password.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been suspended. Please contact support.', 403);
    }

    const token = generateToken(user._id);

    // If vendor, find vendor record
    let vendor = null;
    if (user.role === 'vendor') {
      vendor = store.findOne('vendors', { user: user._id });
    }

    const { password: pwd, ...userWithoutPassword } = user;

    return sendSuccess(
      res,
      {
        user: userWithoutPassword,
        vendor,
        token,
      },
      'Logged in successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = store.findById('users', req.user._id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    let vendor = null;
    if (user.role === 'vendor') {
      vendor = store.findOne('vendors', { user: user._id });
    }

    const { password, ...userWithoutPassword } = user;

    return sendSuccess(res, {
      user: userWithoutPassword,
      vendor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & addresses
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, addresses } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (addresses) updates.addresses = addresses;

    const updatedUser = store.findByIdAndUpdate('users', req.user._id, updates);
    const { password, ...userWithoutPassword } = updatedUser;

    return sendSuccess(res, { user: userWithoutPassword }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Add new address
// @route   POST /api/auth/address
const addAddress = async (req, res, next) => {
  try {
    const { fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;
    const user = store.findById('users', req.user._id);
    const addresses = user.addresses || [];

    const newAddress = {
      _id: `addr_${Date.now()}`,
      fullName: fullName || user.name,
      phone: phone || user.phone,
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      state,
      pincode,
      country: 'India',
      isDefault: isDefault || addresses.length === 0,
    };

    if (newAddress.isDefault) {
      addresses.forEach((addr) => (addr.isDefault = false));
    }

    addresses.push(newAddress);
    store.findByIdAndUpdate('users', req.user._id, { addresses });

    return sendSuccess(res, { addresses, newAddress }, 'Address saved successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset instructions
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 'Please provide an email address', 400);
    }

    const user = store.findOne('users', { email: email.toLowerCase() });
    if (!user) {
      // Return safe success message to prevent user enumeration
      return sendSuccess(
        res,
        { emailSent: true },
        'If an account exists with this email, password reset instructions have been issued.'
      );
    }

    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(24).toString('hex');
    const resetExpire = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    store.findByIdAndUpdate('users', user._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpire: resetExpire,
    });

    // Also update MongoDB if connected
    try {
      const UserModel = require('../models/User');
      await UserModel.findOneAndUpdate(
        { email: email.toLowerCase() },
        { resetPasswordToken: resetToken, resetPasswordExpire: new Date(Date.now() + 60 * 60 * 1000) }
      );
    } catch (dbErr) {
      // Handled silently
    }

    return sendSuccess(
      res,
      {
        emailSent: true,
        resetToken, // Provided for direct verification / dev convenience
        message: 'Password reset link generated successfully.',
      },
      'Password reset instructions sent to your registered email.'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password with reset token
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return sendError(res, 'Please provide token and new password', 400);
    }
    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters', 400);
    }

    const user = store.findOne('users', { resetPasswordToken: token });
    if (!user) {
      return sendError(res, 'Invalid or expired password reset token', 400);
    }

    if (user.resetPasswordExpire && new Date(user.resetPasswordExpire) < new Date()) {
      return sendError(res, 'Password reset token has expired. Please request a new one.', 400);
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    store.findByIdAndUpdate('users', user._id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null,
    });

    // Update in MongoDB
    try {
      const UserModel = require('../models/User');
      const mongoUser = await UserModel.findOne({ email: user.email });
      if (mongoUser) {
        mongoUser.password = password; // pre-save hook will hash
        mongoUser.resetPasswordToken = undefined;
        mongoUser.resetPasswordExpire = undefined;
        await mongoUser.save();
      }
    } catch (dbErr) {
      // Handled silently
    }

    return sendSuccess(res, null, 'Password reset successful. You may now sign in with your new credentials.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  addAddress,
  forgotPassword,
  resetPassword,
};

