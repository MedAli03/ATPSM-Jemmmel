const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Admin-only routes
router.post('/users', auth(['admin']), userController.registerUser);
router.get('/users', auth(['admin']), userController.getAllUsers);
router.patch('/users/:id/status', auth(['admin']), userController.updateUserStatus);

module.exports = router;