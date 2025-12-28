<template>
  <div class="container">
    <div class="page-header">
      <h1>👤 Profile</h1>
      <p>Manage your profile information</p>
    </div>

    <!-- User Information -->
    <div class="card">
      <h3>ℹ️ User Information</h3>
      <div v-if="user" class="profile-info">
        <div class="info-item">
          <span class="label">Name:</span>
          <span class="value">{{ user.name }}</span>
        </div>

        <div class="info-item">
          <span class="label">Email:</span>
          <span class="value">{{ user.email }}</span>
        </div>

        <div class="info-item">
          <span class="label">Role:</span>
          <span :class="`role-badge role-${user.role}`">{{ user.role }}</span>
        </div>

        <div class="info-item">
          <span class="label">Member Since:</span>
          <span class="value">{{ formatDate(user.created_at) }}</span>
        </div>
      </div>
    </div>

    <!-- Employee Information (if employee) -->
    <div v-if="employee" class="card">
      <h3>👔 Employee Information</h3>
      <div class="profile-info">
        <div class="info-item">
          <span class="label">Employee ID:</span>
          <span class="value">{{ employee.employee_id }}</span>
        </div>

        <div class="info-item">
          <span class="label">Position:</span>
          <span class="value">{{ employee.position }}</span>
        </div>

        <div class="info-item">
          <span class="label">Department:</span>
          <span class="value">{{ employee.department }}</span>
        </div>

        <div class="info-item">
          <span class="label">Salary:</span>
          <span class="value">${{ formatSalary(employee.salary) }}</span>
        </div>

        <div class="info-item">
          <span class="label">Hire Date:</span>
          <span class="value">{{ formatDate(employee.hire_date) }}</span>
        </div>
      </div>
    </div>

    <!-- Recent Attendance -->
    <div v-if="recentAttendance.length > 0" class="card">
      <h3>📊 Recent Attendance (Last 7 Days)</h3>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Working Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in recentAttendance" :key="record.id">
              <td>{{ formatDate(record.check_in) }}</td>
              <td>{{ formatTime(record.check_in) }}</td>
              <td>
                <span v-if="record.check_out">{{
                  formatTime(record.check_out)
                }}</span>
                <span v-else class="text-muted">Not checked out</span>
              </td>
              <td>
                <span v-if="record.check_out">{{
                  calculateWorkingHours(record)
                }}</span>
                <span v-else>-</span>
              </td>
              <td>
                <span :class="`status-badge status-${record.status}`">
                  {{ record.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quick Stats -->
    <div v-if="attendanceStats" class="card">
      <h3>📈 This Month's Summary</h3>
      <div class="stats-summary">
        <div class="summary-item">
          <div class="summary-icon">✅</div>
          <div class="summary-content">
            <div class="summary-number">
              {{ attendanceStats.present_days || 0 }}
            </div>
            <div class="summary-label">Present Days</div>
          </div>
        </div>

        <div class="summary-item">
          <div class="summary-icon">⏰</div>
          <div class="summary-content">
            <div class="summary-number">
              {{ attendanceStats.late_days || 0 }}
            </div>
            <div class="summary-label">Late Days</div>
          </div>
        </div>

        <div class="summary-item">
          <div class="summary-icon">❌</div>
          <div class="summary-content">
            <div class="summary-number">
              {{ attendanceStats.absent_days || 0 }}
            </div>
            <div class="summary-label">Absent Days</div>
          </div>
        </div>

        <div class="summary-item">
          <div class="summary-icon">📊</div>
          <div class="summary-content">
            <div class="summary-number">{{ attendancePercentage }}%</div>
            <div class="summary-label">Attendance Rate</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useAttendanceStore } from "../stores/attendance";
import axios from "axios";
import dayjs from "dayjs";

export default {
  name: "Profile",
  setup() {
    const authStore = useAuthStore();
    const attendanceStore = useAttendanceStore();

    const employee = ref(null);
    const recentAttendance = ref([]);
    const loading = ref(false);

    const user = computed(() => authStore.user);
    const attendanceStats = computed(() => attendanceStore.attendanceStats);

    const attendancePercentage = computed(() => {
      if (!attendanceStats.value || !attendanceStats.value.total_days) return 0;

      const presentDays = attendanceStats.value.present_days || 0;
      const totalDays = attendanceStats.value.total_days || 0;

      return Math.round((presentDays / totalDays) * 100);
    });

    const formatDate = (date) => {
      return dayjs(date).format("DD/MM/YYYY");
    };

    const formatTime = (datetime) => {
      return dayjs(datetime).format("HH:mm:ss");
    };

    const formatSalary = (salary) => {
      return new Intl.NumberFormat("en-US").format(salary || 0);
    };

    const calculateWorkingHours = (record) => {
      if (!record.check_out) return "-";

      const checkIn = dayjs(record.check_in);
      const checkOut = dayjs(record.check_out);
      const diff = checkOut.diff(checkIn, "minute");

      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;

      return `${hours}h ${minutes}m`;
    };

    const fetchEmployeeProfile = async () => {
      if (user.value?.role !== "employee") return;

      try {
        const response = await axios.get("/api/employees/me");
        if (response.data.success) {
          employee.value = response.data.data.employee;
        }
      } catch (error) {
        console.error("Failed to fetch employee profile:", error);
      }
    };

    const fetchRecentAttendance = async () => {
      const endDate = dayjs().format("YYYY-MM-DD");
      const startDate = dayjs().subtract(7, "day").format("YYYY-MM-DD");

      try {
        const response = await axios.get("/api/attendance/my-attendance", {
          params: { start_date: startDate, end_date: endDate },
        });

        if (response.data.success) {
          recentAttendance.value = response.data.data.attendances;
        }
      } catch (error) {
        console.error("Failed to fetch recent attendance:", error);
      }
    };

    onMounted(async () => {
      loading.value = true;

      try {
        await Promise.all([
          fetchEmployeeProfile(),
          fetchRecentAttendance(),
          attendanceStore.fetchAttendanceStats(),
        ]);
      } finally {
        loading.value = false;
      }
    });

    return {
      user,
      employee,
      recentAttendance,
      attendanceStats,
      attendancePercentage,
      loading,
      formatDate,
      formatTime,
      formatSalary,
      calculateWorkingHours,
    };
  },
};
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

.profile-info {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #4a5568;
}

.value {
  color: #2d3748;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.role-admin {
  background: #fed7d7;
  color: #742a2a;
}

.role-employee {
  background: #c6f6d5;
  color: #22543d;
}

.table-container {
  overflow-x: auto;
}

.text-muted {
  color: #a0aec0;
  font-style: italic;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 20px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.summary-icon {
  font-size: 2rem;
}

.summary-content {
  flex: 1;
}

.summary-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 4px;
}

.summary-label {
  color: #718096;
  font-size: 14px;
}

@media (max-width: 768px) {
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .stats-summary {
    grid-template-columns: 1fr;
  }
}
</style>
