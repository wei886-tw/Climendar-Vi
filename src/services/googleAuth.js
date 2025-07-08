class GoogleAuthService {
  constructor() {
    this.tokenClient = null
    this.isInitialized = false
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '您的Google客戶端ID'
  }

  // 初始化 Google API
  async initialize() {
    if (this.isInitialized) return

    try {
      // 檢查客戶端 ID 是否設定
      if (!this.clientId || this.clientId === '您的Google客戶端ID') {
        throw new Error('Google OAuth 客戶端 ID 未設定。請在 .env 文件中設定 VITE_GOOGLE_CLIENT_ID')
      }

      // 載入 Google API 客戶端庫
      await this.loadGoogleAPI()

      this.isInitialized = true
    } catch (error) {
      console.error('Google API 初始化失敗:', error)
      throw error
    }
  }

  // 載入 Google API 客戶端庫
  async loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.accounts) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        resolve()
      }
      script.onerror = (error) => {
        console.error('載入 Google API 失敗:', error)
        reject(error)
      }
      document.head.appendChild(script)
    })
  }

  // 登入
  async signIn() {
    await this.initialize()

    return new Promise((resolve, reject) => {
      try {
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events profile email',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              return reject(new Error(tokenResponse.error))
            }
            
            const accessToken = tokenResponse.access_token
            const userInfo = await this.getUserInfo(accessToken)
            
            resolve({
              user: {
                id: userInfo.sub,
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture
              },
              accessToken
            })
          },
          error_callback: (error) => {
            console.error('Google 登入失敗:', error)
            reject(error)
          }
        })
        
        this.tokenClient.requestAccessToken()
      } catch (error) {
        reject(error)
      }
    })
  }

  // 登出
  async signOut(accessToken) {
    if (accessToken) {
      window.google.accounts.oauth2.revoke(accessToken, () => {
        console.log('Google 權杖已撤銷')
      })
    }
  }

  // 取得存取權杖
  async getAccessToken() {
    // 這個方法應該從 auth store 取得 token
    return localStorage.getItem('token') || null
  }

  // 獲取用戶資訊
  async getUserInfo(accessToken) {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('獲取用戶資訊失敗')
    }

    return response.json()
  }
}

export default new GoogleAuthService()