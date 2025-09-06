const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Utilisateur } = require("../models");

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    if (!email || !mot_de_passe) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const user = await Utilisateur.findOne({ where: { email } });
    if (!user)
      return res.status(401).json({ message: "Identifiants invalides" });
    if (!user.is_active)
      return res.status(403).json({ message: "Compte désactivé" });

    const ok = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!ok) return res.status(401).json({ message: "Identifiants invalides" });

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    res.json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/auth/me  (protégé)
exports.me = async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.user.id, {
      attributes: [
        "id",
        "nom",
        "prenom",
        "email",
        "role",
        "avatar_url",
        "is_active",
      ],
    });
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// POST /api/auth/change-password  (protégé)
exports.changePassword = async (req, res) => {
  try {
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
    if (!ancien_mot_de_passe || !nouveau_mot_de_passe) {
      return res.status(400).json({ message: "Champs requis" });
    }
    const user = await Utilisateur.findByPk(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    const ok = await bcrypt.compare(ancien_mot_de_passe, user.mot_de_passe);
    if (!ok)
      return res.status(401).json({ message: "Ancien mot de passe invalide" });

    const hash = await bcrypt.hash(nouveau_mot_de_passe, 10);
    await user.update({ mot_de_passe: hash });
    res.json({ message: "Mot de passe changé" });
  } catch (e) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
