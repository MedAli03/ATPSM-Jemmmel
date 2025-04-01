// middleware/auth.js
const jwt = require("jsonwebtoken");

const authenticate = (roles) => (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).send("Access denied");

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (roles && !roles.includes(verified.role)) {
      return res.status(403).send("Insufficient permissions");
    }
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};
module.exports = authenticate;
