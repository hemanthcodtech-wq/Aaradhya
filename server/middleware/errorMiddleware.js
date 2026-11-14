const { sendError } = require('../utils/responseHandler');

const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`[Error] ${req.method} ${req.originalUrl} - ${err.message}`);

  return sendError(
    res,
    err.message || 'Internal Server Error',
    statusCode,
    process.env.NODE_ENV === 'development' ? err.stack : null
  );
};

module.exports = {
  notFound,
  errorHandler,
};

