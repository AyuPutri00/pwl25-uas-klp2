const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateEmployee } = require('../middleware/validate');

// Protected routes - Employee can access their own profile
router.get('/me', authenticateToken, employeeController.getMyProfile);

// Protected routes - Admin only
router.post('/', 
  authenticateToken, 
  authorizeRole(['admin']), 
  validateEmployee, 
  employeeController.create
);

router.get('/', 
  authenticateToken, 
  authorizeRole(['admin']), 
  employeeController.getAll
);

router.get('/:id', 
  authenticateToken, 
  authorizeRole(['admin']), 
  employeeController.getById
);

router.put('/:id', 
  authenticateToken, 
  authorizeRole(['admin']), 
  employeeController.update
);

router.delete('/:id', 
  authenticateToken, 
  authorizeRole(['admin']), 
  employeeController.delete
);

router.get('/department/:department', 
  authenticateToken, 
  authorizeRole(['admin']), 
  employeeController.getByDepartment
);

module.exports = router;