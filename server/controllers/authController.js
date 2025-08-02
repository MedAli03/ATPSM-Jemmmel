const jwt = require('jsonwebtoken');
const User = require('../models/User');

const login = async (req, res) => {
  const { username, password, role } = req.body;
  
  try {
    // Find user with password scope
    const user = await User.scope('withPassword').findOne({ where: { username } });
    
    if (!user) {
      return res.status(400).json({ error: 'بيانات الاعتماد غير صحيحة' });
    }

    // Check password
    const isMatch = user.validPassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'بيانات الاعتماد غير صحيحة' });
    }

    // Verify role
    if (user.role !== role) {
      return res.status(403).json({ error: 'دور المستخدم غير صحيح' });
    }

    // Check user status
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'حساب المستخدم غير نشط' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Return user info (without password) and token
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
};

module.exports = {
  login
};