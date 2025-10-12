const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Utilisateur } = require("../models");
const meRepo = require("../repos/me.repo");

function parseUserAgent(uaString = "") {
  const ua = uaString || "";
  const result = { browser: null, os: null, device: null };

  const edge = ua.match(/(edg|edge)\/(\d+[.\d]*)/i);
  if (edge) {
    result.browser = `Microsoft Edge ${edge[2]}`.trim();
  } else {
    const chrome =
      !/edg\//i.test(ua) &&
      ua.match(/(chrome|crios)\/(\d+[.\d]*)/i);
    if (chrome) {
      result.browser = `Google Chrome ${chrome[2]}`.trim();
    }
    const firefox = ua.match(/firefox\/(\d+[.\d]*)/i);
    if (!result.browser && firefox) {
      result.browser = `Mozilla Firefox ${firefox[1]}`.trim();
    }
    const safari =
      !/chrome|crios|android/i.test(ua) && ua.match(/version\/(\d+[.\d]*) .*safari/i);
    if (!result.browser && safari) {
      result.browser = `Safari ${safari[1]}`.trim();
    }
    const ie = ua.match(/msie (\d+[.\d]*)/i) || ua.match(/trident\/.*rv:(\d+[.\d]*)/i);
    if (!result.browser && ie) {
      result.browser = `Internet Explorer ${ie[1]}`.trim();
    }
  }

  if (/windows nt 10\.0/i.test(ua)) result.os = "Windows 10";
  else if (/windows nt 11\.0/i.test(ua)) result.os = "Windows 11";
  else if (/windows nt 6\.3/i.test(ua)) result.os = "Windows 8.1";
  else if (/windows nt 6\.2/i.test(ua)) result.os = "Windows 8";
  else if (/linux/i.test(ua)) result.os = "Linux";
  else {
    const macMatch = ua.match(/mac os x (1[01][._]\d+)/i);
    if (macMatch) {
      result.os = `macOS ${macMatch[1].replace(/_/g, ".")}`;
    } else {
      const androidMatch = ua.match(/android (\d+[.\d]*)/i);
      if (androidMatch) {
        result.os = `Android ${androidMatch[1]}`;
      } else {
        const iosMatch = ua.match(/os (\d+_?\d*)/i);
        if (/(iphone|ipad|ipod)/i.test(ua) && iosMatch) {
          result.os = `iOS ${iosMatch[1].replace(/_/g, ".")}`;
        }
      }
    }
  }

  if (/iphone/i.test(ua)) result.device = "iPhone";
  else if (/ipad/i.test(ua)) result.device = "iPad";
  else if (/android/i.test(ua) && /mobile/i.test(ua)) result.device = "Android Phone";
  else if (/android/i.test(ua)) result.device = "Android";
  else if (/macintosh/i.test(ua)) result.device = "Mac";
  else if (/windows/i.test(ua)) result.device = "Windows";

  return result;
}

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

    const now = new Date();
    const rawIp =
      req.headers["x-forwarded-for"]?.split(",")?.[0]?.trim() ||
      req.headers["x-real-ip"] ||
      req.ip ||
      req.socket?.remoteAddress ||
      null;
    const ip = rawIp ? rawIp.slice(0, 45) : null;

    const parsedAgent = parseUserAgent(req.headers["user-agent"] || "");
    const browser = parsedAgent.browser?.slice(0, 150) || null;
    const platform = parsedAgent.os?.slice(0, 150) || null;
    const device = parsedAgent.device?.slice(0, 150) || null;

    await user.update({ last_login: now });
    user.last_login = now;

    try {
      await meRepo.createSession({
        utilisateur_id: user.id,
        user_agent: (req.headers["user-agent"] || "").slice(0, 255) || null,
        browser,
        os: platform,
        device,
        ip_address: ip,
      });
    } catch (sessionError) {
      console.error("Unable to persist session", sessionError);
    }

    res.json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        last_login: user.last_login,
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
