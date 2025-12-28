import { defineStore } from "pinia";
import axios from "axios";

export const useAttendanceStore = defineStore("attendance", {
  state: () => ({
    todayAttendance: null,
    attendanceHistory: [],
    attendanceStats: null,
    loading: false,
    error: null,
  }),

  getters: {
    hasCheckedIn: (state) =>
      state.todayAttendance?.check_in && !state.todayAttendance?.check_out,
    hasCheckedOut: (state) => state.todayAttendance?.check_out,
    canCheckIn: (state) => !state.todayAttendance?.check_in,
    canCheckOut: (state) =>
      state.todayAttendance?.check_in && !state.todayAttendance?.check_out,
  },

  actions: {
    async checkIn() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post("/api/attendance/checkin");

        if (response.data.success) {
          this.todayAttendance = response.data.data.attendance;
          return { success: true, message: "Check-in successful!" };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Check-in failed";
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    async checkOut() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post("/api/attendance/checkout");

        if (response.data.success) {
          this.todayAttendance = response.data.data.attendance;
          return { success: true, message: "Check-out successful!" };
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Check-out failed";
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    async fetchTodayAttendance() {
      try {
        const response = await axios.get("/api/attendance/today");

        if (response.data.success) {
          this.todayAttendance = response.data.data.attendance;
        }
      } catch (error) {
        console.error("Failed to fetch today attendance:", error);
      }
    },

    async fetchAttendanceHistory(startDate, endDate) {
      this.loading = true;

      try {
        const params = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

        const response = await axios.get("/api/attendance/my-attendance", {
          params,
        });

        if (response.data.success) {
          this.attendanceHistory = response.data.data.attendances;
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || "Failed to fetch attendance history";
      } finally {
        this.loading = false;
      }
    },

    async fetchAttendanceStats(month, year) {
      try {
        const params = {};
        if (month) params.month = month;
        if (year) params.year = year;

        const response = await axios.get("/api/attendance/my-stats", {
          params,
        });

        if (response.data.success) {
          this.attendanceStats = response.data.data.stats;
        }
      } catch (error) {
        console.error("Failed to fetch attendance stats:", error);
      }
    },
  },
});
