const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({ errors });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'رمز غير صالح' });
  }
  
  // Default error handling
  res.status(500).json({ error: 'خطأ في الخادم' });
};

module.exports = errorHandler;