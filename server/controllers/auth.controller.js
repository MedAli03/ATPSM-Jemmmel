// controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role', attributes: ['name'] }]
    });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.motDePasse);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { id: user.id, roleName: user.role.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role.name,
        avatarUrl: user.avatarUrl || null
      }
    });
  } catch (e) {
    res.status(500).json({ message: 'Login error', detail: e.message });
  }
};

// Simple /me to verify token & role
exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Role, as: 'role', attributes: ['name'] }],
      attributes: ['id', 'nom', 'prenom', 'email', 'avatarUrl']
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ ...user.toJSON(), role: user.role.name });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};
