<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>🔐 Login</h1>
        <p>Sistem Absensi Karyawan</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>
        
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button
          type="submit"
          class="btn btn-primary login-btn"
          :disabled="loading"
        >
          <span v-if="loading">Logging in...</span>
          <span v-else>Login</span>
        </button>
      </form>
      
      <div class="login-footer">
        <p>Demo Accounts:</p>
        <div class="demo-accounts">
          <div class="demo-account">
            <strong>Admin:</strong> admin@gmail.com / password
          </div>
          <div class="demo-account">
            <strong>Employee:</strong> ayu@gmail.com / password
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const form = ref({
      email: '',
      password: ''
    })
    
    const loading = computed(() => authStore.loading)
    const error = computed(() => authStore.error)
    
    const handleLogin = async () => {
      const result = await authStore.login(form.value)
      
      if (result.success) {
        router.push('/dashboard')
      }
    }
    
    return {
      form,
      loading,
      error,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #2d3748  !important;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.login-header p {
  color: #2d3748 !important;
  font-size: 14px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.login-form {
  margin-bottom: 30px;
}

.login-btn {
  width: 100%;
  font-size: 16px;
  padding: 14px;
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.login-footer p {
  color: #718096;
  font-size: 14px;
  margin-bottom: 10px;
}

.demo-accounts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.demo-account {
  background: #f7fafc;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #4a5568;
}
</style>