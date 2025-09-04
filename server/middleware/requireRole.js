// middleware/requireRole.js
module.exports = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !req.user.roleName) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (allowedRoles.length === 0) return next(); // any authenticated user
  if (!allowedRoles.includes(req.user.roleName)) {
    return res.status(403).json({
      message: 'Forbidden',
      requiredOneOf: allowedRoles,
      yourRole: req.user.roleName
    });
  }
  next();
};
