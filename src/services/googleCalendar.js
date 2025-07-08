import axios from 'axios'

class GoogleCalendarService {
  constructor() {
    this.baseURL = 'https://www.googleapis.com/calendar/v3'
    this.accessToken = null
  }

  // 設定存取權杖
  setAccessToken(token) {
    this.accessToken = token
  }

  // 獲取請求標頭
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    }
  }

  // 獲取日曆列表
  async getCalendarList() {
    try {
      const response = await axios.get(`${this.baseURL}/users/me/calendarList`, {
        headers: this.getHeaders()
      })
      return response.data.items || []
    } catch (error) {
      console.error('獲取日曆列表失敗:', error)
      throw error
    }
  }

  // 獲取指定日曆的事件
  async getCalendarEvents(calendarId = 'primary', timeMin = null, timeMax = null) {
    try {
      const params = {
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 50
      }

      if (timeMin) {
        params.timeMin = timeMin
      }
      if (timeMax) {
        params.timeMax = timeMax
      }

      const response = await axios.get(`${this.baseURL}/calendars/${calendarId}/events`, {
        headers: this.getHeaders(),
        params
      })
      
      return response.data.items || []
    } catch (error) {
      console.error('獲取日曆事件失敗:', error)
      throw error
    }
  }

  // 獲取本月的事件
  async getThisMonthEvents(calendarId = 'primary') {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    return this.getCalendarEvents(
      calendarId,
      startOfMonth.toISOString(),
      endOfMonth.toISOString()
    )
  }

  // 獲取今天的事件
  async getTodayEvents(calendarId = 'primary') {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    return this.getCalendarEvents(
      calendarId,
      startOfDay.toISOString(),
      endOfDay.toISOString()
    )
  }

  // 建立新事件
  async createEvent(calendarId = 'primary', eventData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/calendars/${calendarId}/events`,
        eventData,
        { headers: this.getHeaders() }
      )
      return response.data
    } catch (error) {
      console.error('建立事件失敗:', error)
      throw error
    }
  }

  // 更新事件
  async updateEvent(calendarId = 'primary', eventId, eventData) {
    try {
      const response = await axios.put(
        `${this.baseURL}/calendars/${calendarId}/events/${eventId}`,
        eventData,
        { headers: this.getHeaders() }
      )
      return response.data
    } catch (error) {
      console.error('更新事件失敗:', error)
      throw error
    }
  }

  // 刪除事件
  async deleteEvent(calendarId = 'primary', eventId) {
    try {
      await axios.delete(
        `${this.baseURL}/calendars/${calendarId}/events/${eventId}`,
        { headers: this.getHeaders() }
      )
      return true
    } catch (error) {
      console.error('刪除事件失敗:', error)
      throw error
    }
  }

  // 格式化事件資料給 FullCalendar 使用
  formatEventForFullCalendar(event) {
    return {
      id: event.id,
      title: event.summary || '無標題',
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      url: event.htmlLink,
      description: event.description,
      location: event.location,
      color: this.getEventColor(event.colorId),
      allDay: !event.start.dateTime
    }
  }

  // 獲取事件顏色
  getEventColor(colorId) {
    const colors = {
      '1': '#a4bdfc',
      '2': '#7ae7bf',
      '3': '#dbadff',
      '4': '#ff887c',
      '5': '#fbd75b',
      '6': '#ffb878',
      '7': '#46d6db',
      '8': '#e1e1e1',
      '9': '#5484ed',
      '10': '#51b749',
      '11': '#dc2127'
    }
    return colors[colorId] || '#3788d8'
  }
}

export default new GoogleCalendarService()