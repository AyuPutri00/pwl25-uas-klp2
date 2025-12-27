const { pool } = require('../config/db');

class Employee {
  static async create(employeeData) {
    const { user_id, employee_id, position, department, salary, hire_date } = employeeData;
    
    const [result] = await pool.execute(
      'INSERT INTO employees (user_id, employee_id, position, department, salary, hire_date) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, employee_id, position, department, salary, hire_date]
    );
    
    return result.insertId;
  }
  
  static async findById(id) {
    const [rows] = await pool.execute(`
      SELECT e.*, u.name, u.email 
      FROM employees e 
      JOIN users u ON e.user_id = u.id 
      WHERE e.id = ?
    `, [id]);
    
    return rows[0];
  }
  
  static async findByUserId(userId) {
    const [rows] = await pool.execute(`
      SELECT e.*, u.name, u.email 
      FROM employees e 
      JOIN users u ON e.user_id = u.id 
      WHERE e.user_id = ?
    `, [userId]);
    
    return rows[0];
  }
  
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT e.*, u.name, u.email 
      FROM employees e 
      JOIN users u ON e.user_id = u.id 
      ORDER BY e.created_at DESC
    `);
    
    return rows;
  }
  
  static async update(id, employeeData) {
    const { position, department, salary } = employeeData;
    
    const [result] = await pool.execute(
      'UPDATE employees SET position = ?, department = ?, salary = ? WHERE id = ?',
      [position, department, salary, id]
    );
    
    return result.affectedRows > 0;
  }
  
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM employees WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
  
  static async getByDepartment(department) {
    const [rows] = await pool.execute(`
      SELECT e.*, u.name, u.email 
      FROM employees e 
      JOIN users u ON e.user_id = u.id 
      WHERE e.department = ?
      ORDER BY e.created_at DESC
    `, [department]);
    
    return rows;
  }
}

module.exports = Employee;