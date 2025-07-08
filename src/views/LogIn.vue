<template>
  <!-- 登入頁面容器 -->
  <div class="login-container">
    <!-- 登入卡片 -->
    <div class="login-card">
      <!-- 登入標題區域 -->
      <div class="login-header">
        <h2>登入</h2>
        <p>登入您的帳戶以使用日曆功能</p>
      </div>
      
      <!-- 登入表單 -->
      <el-form 
        ref="loginForm" 
        :model="loginData" 
        :rules="rules" 
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <!-- 電子郵件輸入框 -->
        <el-form-item prop="email">
          <el-input
            v-model="loginData.email"
            placeholder="請輸入電子郵件"
            prefix-icon="User"
            size="large"
            clearable
          />
        </el-form-item>
        
        <!-- 密碼輸入框 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginData.password"
            type="password"
            placeholder="請輸入密碼"
            prefix-icon="Lock"
            size="large"
            show-password
            clearable
          />
        </el-form-item>
        
        <!-- 記住我選項 -->
        <el-form-item>
          <el-checkbox v-model="loginData.remember">記住我</el-checkbox>
        </el-form-item>
        
        <!-- 登入按鈕 -->
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登入中...' : '登入' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 分隔線 -->
      <div class="divider">
        <span>或</span>
      </div>
      
      <!-- Google 登入按鈕 -->
      <el-button 
        class="google-login-button"
        size="large"
        :loading="googleLoading"
        @click="handleGoogleLogin"
      >
        <template #icon>
          <!-- Google 圖示 SVG -->
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83A8 8 0 0 0 1.83 12.56z"/>
            <path fill="#EA4335" d="M8.98 4.72c1.16 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42a4.77 4.77 0 0 1 4.48-2.7z"/>
          </svg>
        </template>
        {{ googleLoading ? 'Google 登入中...' : '使用 Google 登入' }}
      </el-button>
      
      <!-- 登入頁面底部連結 -->
      <div class="login-footer">
        <p>
          <el-link type="primary" @click="handleForgotPassword">忘記密碼？</el-link>
        </p>
        <p>
          還沒有帳戶？
          <el-link type="primary" @click="handleRegister">立即註冊</el-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
// 引入 Vue 3 組合式 API 和相關依賴
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import googleAuthService from '../services/googleAuth'
import googleCalendarService from '../services/googleCalendar'

export default {
  name: 'LogIn',
  setup() {
    // 路由器實例
    const router = useRouter()
    
    // Auth store 實例
    const authStore = useAuthStore()
    
    // 表單引用
    const loginForm = ref(null)
    
    // 載入狀態
    const loading = ref(false)
    const googleLoading = ref(false)
    
    // 登入表單數據
    const loginData = reactive({
      email: '',
      password: '',
      remember: false
    })
    
    // 表單驗證規則
    const rules = {
      email: [
        { required: true, message: '請輸入電子郵件', trigger: 'blur' },
        { type: 'email', message: '請輸入有效的電子郵件格式', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '請輸入密碼', trigger: 'blur' },
        { min: 6, message: '密碼長度至少6個字符', trigger: 'blur' }
      ]
    }
    
    // 處理一般登入
    const handleLogin = async () => {
      if (!loginForm.value) return
      
      try {
        // 驗證表單
        const valid = await loginForm.value.validate()
        if (!valid) return
        
        loading.value = true
        
        // 模擬登入 API 調用
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // 這裡應該調用實際的登入 API
        // const response = await authAPI.login(loginData)
        
        // 模擬成功登入並設定 auth store
        const userData = {
          id: 1,
          email: loginData.email,
          name: loginData.email.split('@')[0]
        }
        const token = 'mock-jwt-token-' + Date.now()
        
        authStore.login(userData, token)
        
        ElMessage.success('登入成功！')
        
        // 登入成功後跳轉到首頁
        router.push('/')
        
      } catch (error) {
        ElMessage.error('登入失敗，請檢查您的帳號密碼')
      } finally {
        loading.value = false
      }
    }
    
    // 處理 Google 登入
    const handleGoogleLogin = async () => {
      try {
        googleLoading.value = true
        
        // 使用 Google Auth Service 進行登入
        const result = await googleAuthService.signIn()
        
        // 設定 Google Calendar Service 的存取權杖
        googleCalendarService.setAccessToken(result.accessToken)
        
        // 儲存用戶資料到 auth store
        authStore.login(result.user, result.accessToken)
        
        ElMessage.success('Google 登入成功！')
        router.push('/')
        
      } catch (error) {
        console.error('Google 登入失敗:', error)
        
        // 根據錯誤類型顯示不同的錯誤訊息
        if (error.message && error.message.includes('客戶端 ID 未設定')) {
          ElMessage.error('Google OAuth 未設定，請聯繫管理員')
        } else if (error.type === 'popup_closed') {
          ElMessage.warning('登入已取消')
        } else if (error.message === 'access_denied') {
          ElMessage.error('登入權限被拒絕')
        } else {
          ElMessage.error('Google 登入失敗，請重試')
        }
      } finally {
        googleLoading.value = false
      }
    }
    
    // 處理忘記密碼
    const handleForgotPassword = () => {
      ElMessage.info('忘記密碼功能開發中...')
    }
    
    // 處理註冊
    const handleRegister = () => {
      ElMessage.info('註冊功能開發中...')
      // 將來可以導航到註冊頁面
      // router.push('/register')
    }
    
    // 返回組件使用的響應式數據和方法
    return {
      loginForm,
      loginData,
      rules,
      loading,
      googleLoading,
      handleLogin,
      handleGoogleLogin,
      handleForgotPassword,
      handleRegister
    }
  }
}
</script>

<style scoped>
/* 登入頁面主容器 */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

/* 登入卡片樣式 */
.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  min-width: 320px;
}

/* 登入標題區域 */
.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.login-header p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* 登入表單樣式 */
.login-form {
  margin-bottom: 20px;
}

.login-form .el-form-item {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  font-weight: 500;
}

/* 分隔線樣式 */
.divider {
  text-align: center;
  margin: 20px 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e4e7ed;
}

.divider span {
  background: white;
  padding: 0 15px;
  color: #909399;
  font-size: 14px;
}

/* Google 登入按鈕樣式 */
.google-login-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  font-weight: 500;
  background: white;
  border: 2px solid #e4e7ed;
  color: #333;
  margin-bottom: 20px;
}

.google-login-button:hover {
  border-color: #4285f4;
  color: #4285f4;
}

/* 登入頁面底部樣式 */
.login-footer {
  text-align: center;
  margin-top: 20px;
}

.login-footer p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.login-footer .el-link {
  font-size: 14px;
}

/* 手機端響應式樣式 */
@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }
  
  .login-header h2 {
    font-size: 24px;
  }
}
</style>