<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from './stores/auth'
import googleAuthService from './services/googleAuth'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    
    // 頁面關閉時自動登出
    const handlePageUnload = () => {
      if (authStore.isAuthenticated) {
        // 使用同步方式清除本地存儲
        authStore.logout()
        
        // 嘗試撤銷 Google 權杖（可能不會完成，但嘗試執行）
        if (authStore.token) {
          googleAuthService.signOut(authStore.token)
        }
      }
    }
    
    // 組件載入時添加事件監聽器
    onMounted(() => {
      window.addEventListener('beforeunload', handlePageUnload)
      window.addEventListener('unload', handlePageUnload)
    })
    
    // 組件卸載時移除事件監聽器
    onUnmounted(() => {
      window.removeEventListener('beforeunload', handlePageUnload)
      window.removeEventListener('unload', handlePageUnload)
    })
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}
</style>