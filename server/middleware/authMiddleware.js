const jwt = require('jsonwebtoken');
const { store } = require('../services/dbAdapter');
const { sendError } = require('../utils/responseHandler');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Not authorized to access this route, token missing', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'multivendor_jwt_super_secure_key_2026_9876543210');
    const user = store.findById('users', decoded.id);

    if (!user) {
      return sendError(res, 'User no longer exists', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated. Please contact support.', 403);
    }

    // Attach user without password
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    return sendError(res, 'Token expired or invalid', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!roles.includes(req.user.role) && req.user.role !== 'super_admin') {
      return sendError(
        res,
        `User role '${req.user.role}' is not authorized to access this route`,
        403
      );
    }
    next();
  };
};

const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (req.user.role === 'super_admin') {
      return next();
    }

    if (req.user.permissions && (req.user.permissions.includes('all') || req.user.permissions.includes(permission))) {
      return next();
    }

    return sendError(res, `Permission '${permission}' required`, 403);
  };
};

module.exports = {
  protect,
  authorize,
  hasPermission,
};

