<template>
  <div class="home-container">
    <div class="header">
      <h1>日曆應用首頁</h1>
      <div class="user-info">
        <template v-if="authStore.isAuthenticated">
          <span>歡迎回來，{{ authStore.user?.name || '使用者' }}！</span>
          <el-button @click="logout" type="danger" size="small">登出</el-button>
        </template>
        <template v-else>
          <span>歡迎使用日曆應用！</span>
          <el-button @click="goToLogin" type="primary" size="small">登入</el-button>
        </template>
      </div>
    </div>
    
    <div class="content">
      <div class="nav-cards">
        <div class="nav-card" @click="goToCalendar">
          <h3>📅 日曆</h3>
          <p>查看和管理您的日程安排</p>
        </div>
        
        <div class="nav-card">
          <h3>📋 任務</h3>
          <p>管理您的待辦事項</p>
        </div>
        
        <div class="nav-card">
          <h3>⚙️ 設定</h3>
          <p>個人化您的應用設定</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { ElButton, ElMessage } from 'element-plus'

export default {
  name: 'Home',
  components: {
    ElButton
  },
  data() {
    return {
      authStore: useAuthStore()
    }
  },
  methods: {
    goToCalendar() {
      if (this.authStore.isAuthenticated) {
        this.$router.push('/calendar')
      } else {
        ElMessage.warning('請先登入以使用日曆功能')
        this.$router.push('/login')
      }
    },
    goToLogin() {
      this.$router.push('/login')
    },
    logout() {
      this.authStore.logout()
      ElMessage.success('已成功登出')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.header h1 {
  color: #333;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.content {
  max-width: 800px;
  margin: 0 auto;
}

.nav-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.nav-card {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.nav-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.nav-card h3 {
  color: #333;
  margin-bottom: 10px;
  font-size: 1.5em;
}

.nav-card p {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
  }
  
  .nav-cards {
    grid-template-columns: 1fr;
  }
}
</style>