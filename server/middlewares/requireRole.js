// Restreint l'accès aux rôles donnés
module.exports =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Non authentifié" });

    const got = String(req.user.role || "").trim().toUpperCase();
    const allowed = roles.map((r) => String(r).trim().toUpperCase());

    if (!allowed.includes(got)) {
      return res.status(403).json({
        message: "Accès refusé",
        required: allowed,
        got,
      });
    }
    next();
  };
