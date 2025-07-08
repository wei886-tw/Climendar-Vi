// Google OAuth 設定
export const googleConfig = {
  // 請在 Google Cloud Console 中建立專案並取得客戶端 ID
  // 1. 前往 https://console.cloud.google.com
  // 2. 建立新專案或選擇現有專案
  // 3. 啟用 Google Identity API
  // 4. 建立 OAuth 2.0 客戶端 ID
  // 5. 將您的網域加入到授權的來源
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '您的Google客戶端ID',
  
  // 授權範圍
  scope: 'openid email profile',
  
  // 回調設定
  redirectUri: window.location.origin + '/login'
}

// 驗證 Google OAuth 設定
export const validateGoogleConfig = () => {
  if (!googleConfig.clientId || googleConfig.clientId === '您的Google客戶端ID') {
    console.warn('Google OAuth 客戶端 ID 未設定')
    return false
  }
  return true
}