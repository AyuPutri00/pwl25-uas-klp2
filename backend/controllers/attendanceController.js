const Attendance = require("../models/Attendance");

const attendanceController = {
  // Check in
  async checkIn(req, res, next) {
    try {
      const userId = req.user.id;

      const attendanceId = await Attendance.checkIn(userId);
      const attendance = await Attendance.getTodayAttendance(userId);

      res.status(201).json({
        success: true,
        message: "Check-in successful",
        data: { attendance },
      });
    } catch (error) {
      if (error.message === "Already checked in today") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  // Check out
  async checkOut(req, res, next) {
    try {
      const userId = req.user.id;

      await Attendance.checkOut(userId);
      const attendance = await Attendance.getTodayAttendance(userId);

      res.json({
        success: true,
        message: "Check-out successful",
        data: { attendance },
      });
    } catch (error) {
      if (error.message.includes("No check-in record found")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  // Get today's attendance
  async getTodayAttendance(req, res, next) {
    try {
      const userId = req.user.id;
      const attendance = await Attendance.getTodayAttendance(userId);

      res.json({
        success: true,
        data: { attendance },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user attendance history
  async getUserAttendance(req, res, next) {
    try {
      const userId = req.user.id;
      const { start_date, end_date } = req.query;

      // Default to current month if no dates provided
      const startDate =
        start_date ||
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          .toISOString()
          .split("T")[0];
      const endDate = end_date || new Date().toISOString().split("T")[0];

      const attendances = await Attendance.getUserAttendance(
        userId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: {
          attendances,
          period: { start_date: startDate, end_date: endDate },
          total: attendances.length,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all attendance (admin only)
  async getAllAttendance(req, res, next) {
    try {
      const { start_date, end_date } = req.query;

      // Default to current month if no dates provided
      const startDate =
        start_date ||
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          .toISOString()
          .split("T")[0];
      const endDate = end_date || new Date().toISOString().split("T")[0];

      const attendances = await Attendance.getAllAttendance(startDate, endDate);

      res.json({
        success: true,
        data: {
          attendances,
          period: { start_date: startDate, end_date: endDate },
          total: attendances.length,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get attendance statistics
  async getAttendanceStats(req, res, next) {
    try {
      const userId = req.user.id;
      const { month, year } = req.query;

      const currentDate = new Date();
      const targetMonth = month || currentDate.getMonth() + 1;
      const targetYear = year || currentDate.getFullYear();

      const stats = await Attendance.getAttendanceStats(
        userId,
        targetMonth,
        targetYear
      );

      res.json({
        success: true,
        data: {
          stats,
          period: { month: targetMonth, year: targetYear },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Mark employee as absent (admin only)
  async markAbsent(req, res, next) {
    try {
      const { user_id, date } = req.body;

      if (!user_id || !date) {
        return res.status(400).json({
          success: false,
          message: "User ID and date are required",
        });
      }

      const attendanceId = await Attendance.markAbsent(user_id, date);

      res.status(201).json({
        success: true,
        message: "Employee marked as absent",
        data: { attendance_id: attendanceId },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get work configuration
  async getWorkConfig(req, res, next) {
    try {
      const config = Attendance.getWorkConfig();
      
      res.json({
        success: true,
        data: { config }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get attendance summary for admin dashboard
  async getAttendanceSummary(req, res, next) {
    try {
      const today = new Date().toISOString().split("T")[0];
      const attendances = await Attendance.getAllAttendance(today, today);

      const summary = {
        total_employees: attendances.length,
        present: attendances.filter((a) => a.status === "present").length,
        late: attendances.filter((a) => a.status === "late").length,
        absent: attendances.filter((a) => a.status === "absent").length,
        not_checked_in: attendances.filter((a) => !a.check_in).length,
      };

      res.json({
        success: true,
        data: {
          summary,
          date: today,
          attendances,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = attendanceController;
