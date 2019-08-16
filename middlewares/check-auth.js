const errors = require('../configs/errors');

module.exports = (req, res, next) => {
  if (!req.userId) {
    const error = new Error(errors.NOT_AUTHENTICATED);
    error.statusCode = 401;
    throw error;
  };
  next();
};