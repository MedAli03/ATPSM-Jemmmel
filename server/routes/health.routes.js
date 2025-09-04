// routes/health.routes.js
const router = require('express').Router();
const verifyToken = require('../middleware/authJwt');
const requireRole = require('../middleware/requireRole');

// Any authenticated user
router.get('/secure', verifyToken, (req, res) => {
  res.json({ ok: true, user: req.user, message: 'You are authenticated' });
});

// Only parent (example)
router.get('/parent-only', verifyToken, requireRole('parent'), (req, res) => {
  res.json({ ok: true, message: 'Hello parent!' });
});

// Only director or president (example)
router.get('/admin-only', verifyToken, requireRole('directeur', 'president'), (req, res) => {
  res.json({ ok: true, message: 'Hello admin (directeur/president)!' });
});

module.exports = router;
