<template>
  <div class="container">
    <div class="page-header">
      <h1>👥 Employee Management</h1>
      <p>Manage company employees</p>
    </div>
    
    <!-- Add Employee Button -->
    <div class="card">
      <div class="flex justify-between items-center">
        <h3>📋 Employee List</h3>
        <button @click="showAddModal = true" class="btn btn-primary">
          ➕ Add Employee
        </button>
      </div>
    </div>
    
    <!-- Employee Table -->
    <div class="card">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>
      
      <div v-else-if="employees.length === 0" class="no-data">
        <p>No employees found</p>
      </div>
      
      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Position</th>
              <th>Department</th>
              <th>Salary</th>
              <th>Hire Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee in employees" :key="employee.id">
              <td>{{ employee.employee_id }}</td>
              <td>{{ employee.name }}</td>
              <td>{{ employee.email }}</td>
              <td>{{ employee.position }}</td>
              <td>{{ employee.department }}</td>
              <td>${{ formatSalary(employee.salary) }}</td>
              <td>{{ formatDate(employee.hire_date) }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="editEmployee(employee)" class="btn btn-secondary btn-sm">
                    ✏️ Edit
                  </button>
                  <button @click="deleteEmployee(employee)" class="btn btn-danger btn-sm">
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Add/Edit Employee Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddModal ? '➕ Add Employee' : '✏️ Edit Employee' }}</h3>
          <button @click="closeModal" class="close-btn">✕</button>
        </div>
        
        <form @submit.prevent="submitForm" class="modal-body">
          <div v-if="formError" class="alert alert-error">
            {{ formError }}
          </div>
          
          <div class="form-group">
            <label class="form-label">Name</label>
            <input
              v-model="employeeForm.name"
              type="text"
              class="form-input"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              v-model="employeeForm.email"
              type="email"
              class="form-input"
              :disabled="showEditModal"
              required
            />
          </div>
          
          <div v-if="showAddModal" class="form-group">
            <label class="form-label">Password</label>
            <input
              v-model="employeeForm.password"
              type="password"
              class="form-input"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Employee ID</label>
            <input
              v-model="employeeForm.employee_id"
              type="text"
              class="form-input"
              :disabled="showEditModal"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Position</label>
            <input
              v-model="employeeForm.position"
              type="text"
              class="form-input"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Department</label>
            <select v-model="employeeForm.department" class="form-input" required>
              <option value="">Select Department</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
              <option value="Design">Design</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Salary</label>
            <input
              v-model="employeeForm.salary"
              type="number"
              class="form-input"
              min="0"
              step="0.01"
            />
          </div>
          
          <div v-if="showAddModal" class="form-group">
            <label class="form-label">Hire Date</label>
            <input
              v-model="employeeForm.hire_date"
              type="date"
              class="form-input"
              required
            />
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="formLoading">
              {{ formLoading ? 'Saving...' : (showAddModal ? 'Add Employee' : 'Update Employee') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import dayjs from 'dayjs'

export default {
  name: 'Employees',
  setup() {
    const employees = ref([])
    const loading = ref(false)
    const formLoading = ref(false)
    const formError = ref(null)
    
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const editingEmployee = ref(null)
    
    const employeeForm = ref({
      name: '',
      email: '',
      password: '',
      employee_id: '',
      position: '',
      department: '',
      salary: '',
      hire_date: dayjs().format('YYYY-MM-DD')
    })
    
    const formatSalary = (salary) => {
      return new Intl.NumberFormat('en-US').format(salary || 0)
    }
    
    const formatDate = (date) => {
      return dayjs(date).format('DD/MM/YYYY')
    }
    
    const fetchEmployees = async () => {
      loading.value = true
      try {
        const response = await axios.get('/api/employees')
        if (response.data.success) {
          employees.value = response.data.data.employees
        }
      } catch (error) {
        console.error('Failed to fetch employees:', error)
      } finally {
        loading.value = false
      }
    }
    
    const resetForm = () => {
      employeeForm.value = {
        name: '',
        email: '',
        password: '',
        employee_id: '',
        position: '',
        department: '',
        salary: '',
        hire_date: dayjs().format('YYYY-MM-DD')
      }
      formError.value = null
    }
    
    const closeModal = () => {
      showAddModal.value = false
      showEditModal.value = false
      editingEmployee.value = null
      resetForm()
    }
    
    const editEmployee = (employee) => {
      editingEmployee.value = employee
      employeeForm.value = {
        name: employee.name,
        email: employee.email,
        employee_id: employee.employee_id,
        position: employee.position,
        department: employee.department,
        salary: employee.salary
      }
      showEditModal.value = true
    }
    
    const submitForm = async () => {
      formLoading.value = true
      formError.value = null
      
      try {
        if (showAddModal.value) {
          // Add new employee
          const response = await axios.post('/api/employees', employeeForm.value)
          if (response.data.success) {
            await fetchEmployees()
            closeModal()
          }
        } else {
          // Update employee
          const response = await axios.put(`/api/employees/${editingEmployee.value.id}`, {
            position: employeeForm.value.position,
            department: employeeForm.value.department,
            salary: employeeForm.value.salary
          })
          if (response.data.success) {
            await fetchEmployees()
            closeModal()
          }
        }
      } catch (error) {
        formError.value = error.response?.data?.message || 'Operation failed'
      } finally {
        formLoading.value = false
      }
    }
    
    const deleteEmployee = async (employee) => {
      if (!confirm(`Are you sure you want to delete ${employee.name}?`)) {
        return
      }
      
      try {
        const response = await axios.delete(`/api/employees/${employee.id}`)
        if (response.data.success) {
          await fetchEmployees()
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Delete failed')
      }
    }
    
    onMounted(() => {
      fetchEmployees()
    })
    
    return {
      employees,
      loading,
      formLoading,
      formError,
      showAddModal,
      showEditModal,
      employeeForm,
      formatSalary,
      formatDate,
      closeModal,
      editEmployee,
      submitForm,
      deleteEmployee
    }
  }
}
</script>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: white !important;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.page-header p {
  color: rgba(255, 255, 255, 0.9) !important;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.table-container {
  overflow-x: auto;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.no-data {
  text-align: center;
  color: #718096;
  padding: 40px 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #718096;
}

.close-btn:hover {
  color: #2d3748;
}

.modal-body {
  padding: 20px;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .modal {
    width: 95%;
    margin: 20px;
  }
}
</style>