const { pool } = require("../config/db");

class Attendance {
  static async checkIn(userId) {
    const today = new Date().toISOString().split("T")[0];

    // Check if already checked in today
    const [existing] = await pool.execute(
      "SELECT * FROM attendances WHERE user_id = ? AND DATE(check_in) = ?",
      [userId, today]
    );

    if (existing.length > 0) {
      throw new Error("Already checked in today");
    }

    const [result] = await pool.execute(
      "INSERT INTO attendances (user_id, check_in, status) VALUES (?, NOW(), ?)",
      [userId, "present"]
    );

    return result.insertId;
  }

  static async checkOut(userId) {
    const today = new Date().toISOString().split("T")[0];

    const [rows] = await pool.execute(
      "SELECT * FROM attendances WHERE user_id = ? AND DATE(check_in) = ? AND check_out IS NULL",
      [userId, today]
    );

    if (rows.length === 0) {
      throw new Error(
        "No check-in record found for today or already checked out"
      );
    }

    const [result] = await pool.execute(
      "UPDATE attendances SET check_out = NOW() WHERE id = ?",
      [rows[0].id]
    );

    return result.affectedRows > 0;
  }

  static async getTodayAttendance(userId) {
    const today = new Date().toISOString().split("T")[0];

    const [rows] = await pool.execute(
      `
      SELECT a.*, u.name, e.employee_id, e.department 
      FROM attendances a 
      JOIN users u ON a.user_id = u.id 
      LEFT JOIN employees e ON a.user_id = e.user_id 
      WHERE a.user_id = ? AND DATE(a.check_in) = ?
    `,
      [userId, today]
    );

    return rows[0];
  }

  static async getUserAttendance(userId, startDate, endDate) {
    const [rows] = await pool.execute(
      `
      SELECT a.*, u.name, e.employee_id, e.department 
      FROM attendances a 
      JOIN users u ON a.user_id = u.id 
      LEFT JOIN employees e ON a.user_id = e.user_id 
      WHERE a.user_id = ? AND DATE(a.check_in) BETWEEN ? AND ?
      ORDER BY a.check_in DESC
    `,
      [userId, startDate, endDate]
    );

    return rows;
  }

  static async getAllAttendance(startDate, endDate) {
    const [rows] = await pool.execute(
      `
      SELECT a.*, u.name, e.employee_id, e.department, e.position 
      FROM attendances a 
      JOIN users u ON a.user_id = u.id 
      LEFT JOIN employees e ON a.user_id = e.user_id 
      WHERE DATE(a.check_in) BETWEEN ? AND ?
      ORDER BY a.check_in DESC
    `,
      [startDate, endDate]
    );

    return rows;
  }

  static async getAttendanceStats(userId, month, year) {
    const [rows] = await pool.execute(
      `
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days
      FROM attendances 
      WHERE user_id = ? AND MONTH(check_in) = ? AND YEAR(check_in) = ?
    `,
      [userId, month, year]
    );

    return rows[0];
  }

  static async markAbsent(userId, date, reason = "No show") {
    const [result] = await pool.execute(
      "INSERT INTO attendances (user_id, check_in, status, notes) VALUES (?, ?, ?, ?)",
      [userId, `${date} 00:00:00`, "absent", reason]
    );

    return result.insertId;
  }
}

module.exports = Attendance;
