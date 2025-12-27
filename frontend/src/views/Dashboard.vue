<template>
  <div class="container">
    <div class="dashboard-header">
      <h1>📊 Dashboard</h1>
      <p>Welcome back, {{ user?.name }}!</p>
    </div>
    
    <!-- Dashboard content will be implemented here -->
    <div class="card">
      <div class="empty-state">
        <h3>🚧 Dashboard Features</h3>
        <p>Dashboard functionality will be implemented here</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Dashboard',
  setup() {
    const authStore = useAuthStore()
    
    const user = computed(() => authStore.user)
    
    // Dashboard functionality will be implemented here
    
    return {
      user
    }
  }
}
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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.empty-state h3 {
  margin-bottom: 16px;
  color: #4a5568;
}

.empty-state p {
  font-size: 16px;
}
</style>