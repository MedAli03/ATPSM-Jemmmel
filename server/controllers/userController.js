const User = require('../models/User');
const { Op } = require('sequelize');

// Register new user (admin only)
const registerUser = async (req, res) => {
  const { username, password, role, name, email } = req.body;
  
  try {
    // Check if user exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'اسم المستخدم أو البريد الإلكتروني موجود مسبقاً' 
      });
    }
    
    // Create new user
    const newUser = await User.create({
      username,
      password,
      role,
      name,
      email
    });
    
    // Return user without password
    const userData = newUser.get({ plain: true });
    delete userData.password;
    
    res.status(201).json(userData);
    
  } catch (err) {
    console.error('User registration error:', err);
    
    // Handle validation errors
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(e => ({
        field: e.path,
        message: e.message
      }));
      return res.status(400).json({ errors });
    }
    
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
};

// Update user status (admin only)
const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }
    
    await user.update({ status });
    res.json({ message: 'تم تحديث حالة المستخدم بنجاح' });
    
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
};

module.exports = {
  registerUser,
  getAllUsers,
  updateUserStatus
};