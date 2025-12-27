const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateLogin } = require('../middleware/validate');

// Public routes
router.post('/login', validateLogin, authController.login);
router.post('/register', authController.register);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/refresh', authenticateToken, authController.refreshToken);

module.exports = router;