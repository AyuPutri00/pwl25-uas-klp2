const Employee = require('../models/Employee');
const User = require('../models/User');

const employeeController = {
  // Create new employee
  async create(req, res, next) {
    try {
      const { name, email, password, position, department, salary, hire_date, employee_id } = req.body;
      
      // Create user first
      const userId = await User.create({
        name,
        email,
        password,
        role: 'employee'
      });
      
      // Create employee record
      const employeeRecordId = await Employee.create({
        user_id: userId,
        employee_id: employee_id || `EMP${Date.now()}`,
        position,
        department,
        salary: salary || 0,
        hire_date: hire_date || new Date().toISOString().split('T')[0]
      });
      
      const newEmployee = await Employee.findById(employeeRecordId);
      
      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: { employee: newEmployee }
      });
      
    } catch (error) {
      next(error);
    }
  },
  
  // Get all employees
  async getAll(req, res, next) {
    try {
      const employees = await Employee.getAll();
      
      res.json({
        success: true,
        data: { 
          employees,
          total: employees.length
        }
      });
      
    } catch (error) {
      next(error);
    }
  },
  
  // Get employee by ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const employee = await Employee.findById(id);
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      res.json({
        success: true,
        data: { employee }
      });
      
    } catch (error) {
      next(error);
    }
  },
  
  // Update employee
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { position, department, salary } = req.body;
      
      const updated = await Employee.update(id, {
        position,
        department,
        salary
      });
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      const updatedEmployee = await Employee.findById(id);
      
      res.json({
        success: true,
        message: 'Employee updated successfully',
        data: { employee: updatedEmployee }
      });
      
    } catch (error) {
      next(error);
    }
  },
  
  // Delete employee
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const employee = await Employee.findById(id);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      // Delete employee record
      await Employee.delete(id);
      
      // Delete user record
      await User.delete(employee.user_id);
      
      res.json({
        success: true,
        message: 'Employee deleted successfully'
      });
      
    } catch (error) {
      next(error);
    }
  },
  
  // Get employees by department
  async getByDepartment(req, res, next) {
    try {
      const { department } = req.params;
      const employees = await Employee.getByDepartment(department);
      
      res.json({
        success: true,
        data: { 
          employees,
          department,
          total: employees.length
        }
      });
      
    } catch (error) {
      next(error);
    }
  },
  
  // Get current employee profile
  async getMyProfile(req, res, next) {
    try {
      const employee = await Employee.findByUserId(req.user.id);
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee profile not found'
        });
      }
      
      res.json({
        success: true,
        data: { employee }
      });
      
    } catch (error) {
      next(error);
    }
  }
};

module.exports = employeeController;