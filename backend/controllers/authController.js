const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const authController = {
  // Login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      // Verify password
      const isValidPassword = await User.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      // Generate token
      const token = generateToken(user);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token
        }
      });
      
    } catch (error) {
      next(error);
    }
  },
  
  // Register
  async register(req, res, next) {
    try {
      const { name, email, password, role = 'employee' } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      
      // Create new user
      const userId = await User.create({ name, email, password, role });
      const newUser = await User.findById(userId);
      
      // Generate token
      const token = generateToken(newUser);
      
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: newUser,
          token
        }
      });
      
    } catch (error) {
      next(error);
    }
  },
  
  // Get current user profile
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        data: { user }
      });
      
    } catch (error) {
      next(error);
    }
  },
  
  // Refresh token
  async refreshToken(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      const token = generateToken(user);
      
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: { token }
      });
      
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;