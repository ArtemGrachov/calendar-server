const jwt = require('jsonwebtoken');
const config = require('../configs/main');
const errors = require('../errors');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, config.jwtKey);
    } catch (error) {
      error.message = errors.NOT_AUTHENTICATED;
      error.statusCode = 401;
      throw error;
    };
  
    if (!decodedToken) {
      error.message = errors.NOT_AUTHENTICATED;
      error.statusCode = 401;
      throw error;
    }
  
    req.userId = decodedToken.userId;
  }

  next();
};