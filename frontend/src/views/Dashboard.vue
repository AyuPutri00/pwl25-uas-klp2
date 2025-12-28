<template>
  <div class="container">
    <div class="dashboard-header">
      <h1>📊 Dashboard</h1>
      <p>Welcome back, {{ user?.name }}!</p>
    </div>

    <!-- Quick Actions -->
    <div class="card">
      <h3>⚡ Quick Actions</h3>
      <div class="quick-actions">
        <button
          v-if="canCheckIn"
          @click="handleCheckIn"
          class="btn btn-success"
          :disabled="loading"
        >
          ✅ Check In
        </button>

        <button
          v-if="canCheckOut"
          @click="handleCheckOut"
          class="btn btn-danger"
          :disabled="loading"
        >
          🚪 Check Out
        </button>

        <div v-if="hasCheckedOut" class="status-message">
          ✨ You've completed your work for today!
        </div>
      </div>
    </div>

    <!-- Today's Attendance -->
    <div class="card">
      <h3>📅 Today's Attendance</h3>
      <div v-if="todayAttendance" class="attendance-info">
        <div class="attendance-item">
          <span class="label">Status:</span>
          <span :class="`status-badge status-${todayAttendance.status}`">
            {{ todayAttendance.status }}
          </span>
        </div>

        <div class="attendance-item">
          <span class="label">Check In:</span>
          <span>{{ formatTime(todayAttendance.check_in) }}</span>
        </div>

        <div v-if="todayAttendance.check_out" class="attendance-item">
          <span class="label">Check Out:</span>
          <span>{{ formatTime(todayAttendance.check_out) }}</span>
        </div>

        <div v-if="workingHours" class="attendance-item">
          <span class="label">Working Hours:</span>
          <span>{{ workingHours }}</span>
        </div>
      </div>

      <div v-else class="no-attendance">
        <p>No attendance record for today</p>
      </div>
    </div>

    <!-- Statistics (if available) -->
    <div v-if="attendanceStats" class="card">
      <h3>📈 This Month's Statistics</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ attendanceStats.present_days || 0 }}</div>
          <div class="stat-label">Present Days</div>
        </div>

        <div class="stat-item">
          <div class="stat-number">{{ attendanceStats.late_days || 0 }}</div>
          <div class="stat-label">Late Days</div>
        </div>

        <div class="stat-item">
          <div class="stat-number">{{ attendanceStats.absent_days || 0 }}</div>
          <div class="stat-label">Absent Days</div>
        </div>

        <div class="stat-item">
          <div class="stat-number">{{ attendanceStats.total_days || 0 }}</div>
          <div class="stat-label">Total Days</div>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div
      v-if="message"
      :class="`alert ${
        message.type === 'success' ? 'alert-success' : 'alert-error'
      }`"
    >
      {{ message.text }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useAttendanceStore } from "../stores/attendance";
import dayjs from "dayjs";

export default {
  name: "Dashboard",
  setup() {
    const authStore = useAuthStore();
    const attendanceStore = useAttendanceStore();

    const message = ref(null);

    const user = computed(() => authStore.user);
    const loading = computed(() => attendanceStore.loading);
    const todayAttendance = computed(() => attendanceStore.todayAttendance);
    const attendanceStats = computed(() => attendanceStore.attendanceStats);
    const canCheckIn = computed(() => attendanceStore.canCheckIn);
    const canCheckOut = computed(() => attendanceStore.canCheckOut);
    const hasCheckedOut = computed(() => attendanceStore.hasCheckedOut);

    const workingHours = computed(() => {
      if (
        !todayAttendance.value?.check_in ||
        !todayAttendance.value?.check_out
      ) {
        return null;
      }

      const checkIn = dayjs(todayAttendance.value.check_in);
      const checkOut = dayjs(todayAttendance.value.check_out);
      const diff = checkOut.diff(checkIn, "minute");

      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;

      return `${hours}h ${minutes}m`;
    });

    const formatTime = (datetime) => {
      return dayjs(datetime).format("HH:mm:ss");
    };

    const showMessage = (text, type = "success") => {
      message.value = { text, type };
      setTimeout(() => {
        message.value = null;
      }, 5000);
    };

    const handleCheckIn = async () => {
      const result = await attendanceStore.checkIn();
      showMessage(result.message, result.success ? "success" : "error");
    };

    const handleCheckOut = async () => {
      const result = await attendanceStore.checkOut();
      showMessage(result.message, result.success ? "success" : "error");
    };

    onMounted(() => {
      attendanceStore.fetchTodayAttendance();
      attendanceStore.fetchAttendanceStats();
    });

    return {
      user,
      loading,
      todayAttendance,
      attendanceStats,
      canCheckIn,
      canCheckOut,
      hasCheckedOut,
      workingHours,
      message,
      formatTime,
      handleCheckIn,
      handleCheckOut,
    };
  },
};
</script>

<style scoped>
.dashboard-header {
  text-align: center;
  margin-bottom: 30px;
}

.dashboard-header h1 {
  color: white !important;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.dashboard-header p {
  color: rgba(255, 255, 255, 0.9) !important;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.quick-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.status-message {
  background: #c6f6d5;
  color: #22543d;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
}

.attendance-info {
  display: grid;
  gap: 1rem;
}

.attendance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.attendance-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #4a5568;
}

.no-attendance {
  text-align: center;
  color: #718096;
  padding: 40px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f7fafc;
  border-radius: 8px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  color: #718096;
  font-size: 14px;
}
</style>
