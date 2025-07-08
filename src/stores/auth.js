import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
    isGoogleAuth: localStorage.getItem('isGoogleAuth') === 'true'
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user
  },
  
  actions: {
    login(userData, userToken, isGoogle = true) {
      this.user = userData
      this.token = userToken
      this.isGoogleAuth = isGoogle
      
      // 儲存到 localStorage
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', userToken)
      localStorage.setItem('isGoogleAuth', isGoogle.toString())
    },
    
    logout() {
      this.user = null
      this.token = null
      this.isGoogleAuth = false
      
      // 清除 localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('isGoogleAuth')
    },
    
    // 更新用戶資料
    updateUser(userData) {
      this.user = { ...this.user, ...userData }
      localStorage.setItem('user', JSON.stringify(this.user))
    }
  }
})