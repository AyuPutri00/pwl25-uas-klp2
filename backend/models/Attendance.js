const { pool } = require('../config/db');

class Attendance {
  // Konfigurasi jam kerja - bisa dipindah ke config file
  static WORK_START_TIME = '08:00:00'; // Jam masuk kerja
  static LATE_THRESHOLD_MINUTES = 15; // Toleransi keterlambatan dalam menit
  
  static async create(attendanceData) {
    const { user_id, check_in, check_out = null, status = 'present' } = attendanceData;
    
    const [result] = await pool.execute(
      'INSERT INTO attendances (user_id, check_in, check_out, status) VALUES (?, ?, ?, ?)',
      [user_id, check_in, check_out, status]
    );
    
    return result.insertId;
  }

  // Method untuk check in dengan logika keterlambatan
  static async checkIn(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentDateTime = new Date();
      
      // Cek apakah sudah check-in hari ini
      const existingAttendance = await this.getTodayAttendance(userId);
      if (existingAttendance && existingAttendance.check_in) {
        throw new Error('Already checked in today');
      }

      // Tentukan status berdasarkan waktu check-in
      const status = this.determineAttendanceStatus(currentDateTime);

      const [result] = await pool.execute(
        'INSERT INTO attendances (user_id, check_in, status) VALUES (?, ?, ?)',
        [userId, currentDateTime, status]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Method untuk check out
  static async checkOut(userId) {
    try {
      const currentDateTime = new Date();

      // Cari record attendance hari ini
      const attendance = await this.getTodayAttendance(userId);
      if (!attendance || !attendance.check_in) {
        throw new Error('No check-in record found for today');
      }

      if (attendance.check_out) {
        throw new Error('Already checked out today');
      }

      // Update check-out time
      const [result] = await pool.execute(
        'UPDATE attendances SET check_out = ? WHERE id = ?',
        [currentDateTime, attendance.id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Logika untuk menentukan status keterlambatan
  static determineAttendanceStatus(checkInDateTime) {
    const checkInTime = checkInDateTime.toTimeString().split(' ')[0]; // HH:MM:SS
    const workStart = new Date(`1970-01-01T${this.WORK_START_TIME}`);
    const checkIn = new Date(`1970-01-01T${checkInTime}`);
    
    const diffMinutes = (checkIn - workStart) / (1000 * 60);
    
    if (diffMinutes <= this.LATE_THRESHOLD_MINUTES) {
      return 'present'; // Tepat waktu atau dalam toleransi
    } else {
      return 'late'; // Terlambat
    }
  }
  
  // Get today's attendance for a user
  static async getTodayAttendance(userId) {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await pool.execute(`
      SELECT a.*, u.name as user_name 
      FROM attendances a 
      JOIN users u ON a.user_id = u.id 
      WHERE a.user_id = ? AND DATE(a.check_in) = ?
    `, [userId, today]);
    
    return rows[0];
  }

  // Get user attendance history
  static async getUserAttendance(userId, startDate, endDate) {
    let query = `
      SELECT a.*, u.name as user_name 
      FROM attendances a 
      JOIN users u ON a.user_id = u.id 
      WHERE a.user_id = ?
    `;
    const params = [userId];
    
    if (startDate) {
      query += ' AND DATE(a.check_in) >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND DATE(a.check_in) <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY a.check_in DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Get all attendance records (for admin)
  static async getAllAttendance(startDate, endDate) {
    let query = `
      SELECT a.*, u.name as user_name, u.email,
             e.employee_id, e.position, e.department
      FROM attendances a 
      JOIN users u ON a.user_id = u.id 
      LEFT JOIN employees e ON u.id = e.user_id
    `;
    const params = [];
    
    if (startDate || endDate) {
      query += ' WHERE';
      if (startDate) {
        query += ' DATE(a.check_in) >= ?';
        params.push(startDate);
      }
      if (endDate) {
        if (startDate) query += ' AND';
        query += ' DATE(a.check_in) <= ?';
        params.push(endDate);
      }
    }
    
    query += ' ORDER BY a.check_in DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Get attendance statistics
  static async getAttendanceStats(userId, month, year) {
    let query = `
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days
      FROM attendances 
      WHERE user_id = ?
    `;
    const params = [userId];
    
    if (month && year) {
      query += ' AND MONTH(check_in) = ? AND YEAR(check_in) = ?';
      params.push(month, year);
    } else if (year) {
      query += ' AND YEAR(check_in) = ?';
      params.push(year);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows[0];
  }

  // Mark employee as absent (admin function)
  static async markAbsent(userId, date, reason = null) {
    // Check if attendance already exists for this date
    const [existingRows] = await pool.execute(
      'SELECT * FROM attendances WHERE user_id = ? AND DATE(check_in) = ?',
      [userId, date]
    );
    
    if (existingRows.length > 0) {
      throw new Error('Attendance record already exists for this date');
    }

    const absentDateTime = new Date(`${date}T00:00:00`);
    const [result] = await pool.execute(
      'INSERT INTO attendances (user_id, check_in, status) VALUES (?, ?, ?)',
      [userId, absentDateTime, 'absent']
    );

    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(`
      SELECT a.*, u.name as user_name, u.email,
             e.employee_id, e.position, e.department
      FROM attendances a 
      JOIN users u ON a.user_id = u.id 
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE a.id = ?
    `, [id]);
    
    return rows[0];
  }
  
  static async update(id, attendanceData) {
    const { check_out, status } = attendanceData;
    
    const [result] = await pool.execute(
      'UPDATE attendances SET check_out = ?, status = ? WHERE id = ?',
      [check_out, status, id]
    );
    
    return result.affectedRows > 0;
  }
  
  // Get work configuration
  static getWorkConfig() {
    return {
      workStartTime: this.WORK_START_TIME,
      lateThresholdMinutes: this.LATE_THRESHOLD_MINUTES,
      workEndTime: '17:00:00', // 5 PM
      workStartTimeFormatted: '08:00 AM',
      workEndTimeFormatted: '05:00 PM',
      lateThresholdFormatted: 'After 08:15 AM'
    };
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM attendances WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = Attendance;

module.exports = Attendance;