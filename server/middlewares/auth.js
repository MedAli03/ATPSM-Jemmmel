// Vérifie le JWT et attache req.user = { id, role }
const jwt = require("jsonwebtoken");

function extractToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);

  const queryToken = req.query?.token;
  if (Array.isArray(queryToken)) {
    if (queryToken.length === 0) return null;
    return queryToken[0].startsWith("Bearer ")
      ? queryToken[0].slice(7)
      : queryToken[0];
  }
  if (typeof queryToken === "string" && queryToken.trim()) {
    return queryToken.startsWith("Bearer ")
      ? queryToken.slice(7)
      : queryToken;
  }

  return null;
}

module.exports = (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: "Token manquant" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (e) {
    return res.status(401).json({ message: "Token invalide" });
  }
};
