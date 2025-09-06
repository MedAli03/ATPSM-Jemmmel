// Vérifie le JWT et attache req.user = { id, role }
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Token manquant" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (e) {
    return res.status(401).json({ message: "Token invalide" });
  }
};
