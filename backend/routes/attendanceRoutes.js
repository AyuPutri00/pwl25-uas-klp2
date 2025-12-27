const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Employee routes
router.post('/checkin', authenticateToken, attendanceController.checkIn);
router.post('/checkout', authenticateToken, attendanceController.checkOut);
router.get('/today', authenticateToken, attendanceController.getTodayAttendance);
router.get('/my-attendance', authenticateToken, attendanceController.getUserAttendance);
router.get('/my-stats', authenticateToken, attendanceController.getAttendanceStats);

// Admin routes
router.get('/all', 
  authenticateToken, 
  authorizeRole(['admin']), 
  attendanceController.getAllAttendance
);

router.post('/mark-absent', 
  authenticateToken, 
  authorizeRole(['admin']), 
  attendanceController.markAbsent
);

router.get('/summary', 
  authenticateToken, 
  authorizeRole(['admin']), 
  attendanceController.getAttendanceSummary
);

module.exports = router;