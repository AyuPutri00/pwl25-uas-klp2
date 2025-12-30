<template>
  <div class="container">
    <div class="page-header">
      <h1>📋 Attendance History</h1>
      <p>View your attendance records</p>
    </div>

    <!-- Date Filter -->
    <div class="card">
      <h3>🔍 Filter by Date</h3>
      <div class="date-filter">
        <div class="form-group">
          <label class="form-label">Start Date</label>
          <input
            v-model="dateFilter.startDate"
            type="date"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">End Date</label>
          <input v-model="dateFilter.endDate" type="date" class="form-input" />
        </div>

        <button @click="fetchAttendance" class="btn btn-primary">Filter</button>
      </div>
    </div>

    <!-- Attendance Table -->
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h3>📊 Attendance Records</h3>
        <span class="record-count">{{ attendanceHistory.length }} records</span>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else-if="attendanceHistory.length === 0" class="no-data">
        <p>No attendance records found for the selected period</p>
      </div>

      <div v-else class="table-container">
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
            <tr v-for="record in attendanceHistory" :key="record.id">
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

    <!-- Monthly Statistics -->
    <div v-if="attendanceStats" class="card">
      <h3>📈 Monthly Statistics</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-number">
              {{ attendanceStats.present_days || 0 }}
            </div>
            <div class="stat-label">Present Days</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-info">
            <div class="stat-number">{{ attendanceStats.late_days || 0 }}</div>
            <div class="stat-label">Late Days</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">❌</div>
          <div class="stat-info">
            <div class="stat-number">
              {{ attendanceStats.absent_days || 0 }}
            </div>
            <div class="stat-label">Absent Days</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <div class="stat-number">{{ attendanceStats.total_days || 0 }}</div>
            <div class="stat-label">Total Days</div>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useAttendanceStore } from "../stores/attendance";
import dayjs from "dayjs";

export default {
  name: "Attendance",
  setup() {
    const attendanceStore = useAttendanceStore();

    const dateFilter = ref({
      startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
      endDate: dayjs().format("YYYY-MM-DD"),
    });

    const loading = computed(() => attendanceStore.loading);
    const attendanceHistory = computed(() => attendanceStore.attendanceHistory);
    const attendanceStats = computed(() => attendanceStore.attendanceStats);

    const formatDate = (datetime) => {
      return dayjs(datetime).format("DD/MM/YYYY");
    };

    const formatTime = (datetime) => {
      return dayjs(datetime).format("HH:mm:ss");
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

    const fetchAttendance = () => {
      attendanceStore.fetchAttendanceHistory(
        dateFilter.value.startDate,
        dateFilter.value.endDate
      );
    };

    onMounted(() => {
      fetchAttendance();
      attendanceStore.fetchAttendanceStats();
    });

    return {
      dateFilter,
      loading,
      attendanceHistory,
      attendanceStats,
      formatDate,
      formatTime,
      calculateWorkingHours,
      fetchAttendance,
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

.date-filter {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
}

.record-count {
  background: #e2e8f0;
  color: #4a5568;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.table-container {
  overflow-x: auto;
}

.no-data {
  text-align: center;
  color: #718096;
  padding: 40px 0;
}

.text-muted {
  color: #a0aec0;
  font-style: italic;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 4px;
}

.stat-label {
  color: #718096;
  font-size: 14px;
}

@media (max-width: 768px) {
  .date-filter {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
