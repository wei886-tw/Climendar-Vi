<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <div class="header-left">
        <h2>📅 日曆</h2>
        <span v-if="authStore.user" class="user-greeting">{{ authStore.user?.name || '使用者' }}</span>
      </div>
      <div class="header-actions">
        <el-button @click="refreshCalendar" type="success" size="small" :loading="loading">
          重新整理
        </el-button>
        <el-button @click="goHome" type="primary" size="small">回到首頁</el-button>
        <el-button @click="logout" type="danger" size="small">登出</el-button>
      </div>
    </div>
    
    <div class="calendar-content">
      <!-- 載入中 -->
      <div v-if="loading" class="loading-container">
        <el-loading-service />
        <p>載入 Google 日曆中...</p>
      </div>
      
      <!-- 錯誤訊息 -->
      <div v-else-if="error" class="error-container">
        <h3>❌ 載入失敗</h3>
        <p>{{ error }}</p>
        <el-button @click="refreshCalendar" type="primary">重試</el-button>
      </div>
      
      <!-- 日曆內容 -->
      <div v-else class="calendar-wrapper">
        <!-- 日曆視圖切換 -->
        <div class="calendar-controls">
          <div class="view-selector">
            <el-button-group>
              <el-button 
                :type="currentView === 'dayGridMonth' ? 'primary' : 'default'"
                @click="changeView('dayGridMonth')"
                size="small"
                class="view-button"
                :class="{ active: currentView === 'dayGridMonth' }"
              >
                月檢視
              </el-button>
              <el-button 
                :type="currentView === 'timeGridWeek' ? 'primary' : 'default'"
                @click="changeView('timeGridWeek')"
                size="small"
                class="view-button"
                :class="{ active: currentView === 'timeGridWeek' }"
              >
                週檢視
              </el-button>
              <el-button 
                :type="currentView === 'timeGridDay' ? 'primary' : 'default'"
                @click="changeView('timeGridDay')"
                size="small"
                class="view-button"
                :class="{ active: currentView === 'timeGridDay' }"
              >
                日檢視
              </el-button>
            </el-button-group>
          </div>
          
          <div class="calendar-actions">
            <el-button @click="showAddEventDialog" type="success" size="small">
              新增事件
            </el-button>
          </div>
        </div>

        <!-- FullCalendar 組件 -->
        <div class="fullcalendar-container">
          <FullCalendar
            ref="calendarRef"
            :options="calendarOptions"
          />
        </div>
        
        <!-- 日曆資訊 -->
        <div class="calendar-info">
          <h3>📋 我的日曆</h3>
          <div class="calendar-stats">
            <div class="stat-item">
              <span class="stat-label">今天事件:</span>
              <span class="stat-value">{{ todayEvents.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">本月事件:</span>
              <span class="stat-value">{{ monthEvents.length }}</span>
            </div>
          </div>
        </div>
        
        <!-- 今天的事件 -->
        <div class="today-events">
          <h4>🗓️ 今天的事件</h4>
          <div v-if="todayEvents.length === 0" class="no-events">
            今天沒有事件
          </div>
          <div v-else class="events-list">
            <div v-for="event in todayEvents" :key="event.id" class="event-item">
              <div class="event-time">
                {{ formatEventTime(event) }}
              </div>
              <div class="event-details">
                <h5>{{ event.summary || '無標題' }}</h5>
                <p v-if="event.location">📍 {{ event.location }}</p>
                <p v-if="event.description">{{ event.description }}</p>
                <div class="event-actions">
                  <el-button @click="editEvent(event)" type="primary" size="mini">編輯</el-button>
                  <el-button @click="deleteEventConfirm(event)" type="danger" size="mini">刪除</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增事件對話框 -->
    <el-dialog
      title="新增事件"
      v-model="addEventDialog"
      width="500px"
      @close="resetEventForm"
    >
      <el-form :model="eventForm" label-width="80px">
        <el-form-item label="標題">
          <el-input v-model="eventForm.summary" placeholder="輸入事件標題" />
        </el-form-item>
        <el-form-item label="開始時間">
          <el-date-picker
            v-model="eventForm.startTime"
            type="datetime"
            placeholder="選擇開始時間"
            format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>
        <el-form-item label="結束時間">
          <el-date-picker
            v-model="eventForm.endTime"
            type="datetime"
            placeholder="選擇結束時間"
            format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>
        <el-form-item label="地點">
          <el-input v-model="eventForm.location" placeholder="輸入地點" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="eventForm.description"
            type="textarea"
            placeholder="輸入事件描述"
            rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addEventDialog = false">取消</el-button>
        <el-button type="primary" @click="createEvent" :loading="creating">
          建立事件
        </el-button>
      </template>
    </el-dialog>

    <!-- 編輯事件對話框 -->
    <el-dialog
      title="編輯事件"
      v-model="editEventDialog"
      width="500px"
      @close="resetEventForm"
    >
      <el-form :model="eventForm" label-width="80px">
        <el-form-item label="標題">
          <el-input v-model="eventForm.summary" placeholder="輸入事件標題" />
        </el-form-item>
        <el-form-item label="開始時間">
          <el-date-picker
            v-model="eventForm.startTime"
            type="datetime"
            placeholder="選擇開始時間"
            format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>
        <el-form-item label="結束時間">
          <el-date-picker
            v-model="eventForm.endTime"
            type="datetime"
            placeholder="選擇結束時間"
            format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>
        <el-form-item label="地點">
          <el-input v-model="eventForm.location" placeholder="輸入地點" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="eventForm.description"
            type="textarea"
            placeholder="輸入事件描述"
            rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editEventDialog = false">取消</el-button>
        <el-button type="primary" @click="updateEvent" :loading="updating">
          更新事件
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElButton, ElMessage, ElDialog, ElForm, ElFormItem, ElInput, ElDatePicker, ElMessageBox } from 'element-plus'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import googleCalendarService from '../services/googleCalendar'
import googleAuthService from '../services/googleAuth'

export default {
  name: 'Calendar',
  components: {
    ElButton,
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    ElDatePicker,
    FullCalendar
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    // 響應式資料
    const loading = ref(false)
    const error = ref('')
    const todayEvents = ref([])
    const monthEvents = ref([])
    const calendarRef = ref(null)
    const currentView = ref('dayGridMonth')
    
    // 事件表單
    const addEventDialog = ref(false)
    const editEventDialog = ref(false)
    const creating = ref(false)
    const updating = ref(false)
    const currentEditEvent = ref(null)
    const eventForm = ref({
      summary: '',
      startTime: null,
      endTime: null,
      location: '',
      description: ''
    })
    
    // FullCalendar 配置
    const calendarOptions = computed(() => ({
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: currentView.value,
      locale: 'zh-tw',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      buttonText: {
        today: '今天',
        month: '月',
        week: '週',
        day: '日'
      },
      events: monthEvents.value.map(event => 
        googleCalendarService.formatEventForFullCalendar(event)
      ),
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      weekends: true,
      select: handleDateSelect,
      eventClick: handleEventClick,
      eventDrop: handleEventDrop,
      eventResize: handleEventResize,
      height: 'auto',
      aspectRatio: 1.8
    }))
    
    // 載入日曆資料
    const loadCalendarData = async () => {
      try {
        loading.value = true
        error.value = ''
        
        // 確保有存取權杖
        const accessToken = await googleAuthService.getAccessToken()
        if (!accessToken) {
          throw new Error('無法取得 Google 存取權杖')
        }
        
        // 設定存取權杖
        googleCalendarService.setAccessToken(accessToken)
        
        // 載入今天和本月的事件
        const [todayEventsData, monthEventsData] = await Promise.all([
          googleCalendarService.getTodayEvents(),
          googleCalendarService.getThisMonthEvents()
        ])
        
        todayEvents.value = todayEventsData
        monthEvents.value = monthEventsData
        
      } catch (err) {
        console.error('載入日曆資料失敗:', err)
        error.value = err.message || '載入日曆資料失敗'
      } finally {
        loading.value = false
      }
    }
    
    // 重新整理日曆
    const refreshCalendar = () => {
      loadCalendarData()
    }
    
    // 切換視圖
    const changeView = (view) => {
      currentView.value = view
      if (calendarRef.value) {
        calendarRef.value.getApi().changeView(view)
      }
    }
    
    // 處理日期選擇
    const handleDateSelect = (selectInfo) => {
      eventForm.value.startTime = new Date(selectInfo.start)
      eventForm.value.endTime = new Date(selectInfo.end)
      showAddEventDialog()
    }
    
    // 處理事件點擊
    const handleEventClick = (clickInfo) => {
      const event = monthEvents.value.find(e => e.id === clickInfo.event.id)
      if (event) {
        editEvent(event)
      }
    }
    
    // 處理事件拖拽
    const handleEventDrop = async (info) => {
      try {
        const eventId = info.event.id
        const event = monthEvents.value.find(e => e.id === eventId)
        if (event) {
          const updatedEvent = {
            ...event,
            start: {
              dateTime: info.event.start.toISOString()
            },
            end: {
              dateTime: info.event.end.toISOString()
            }
          }
          await googleCalendarService.updateEvent('primary', eventId, updatedEvent)
          ElMessage.success('事件時間已更新')
          await loadCalendarData()
        }
      } catch (err) {
        console.error('更新事件失敗:', err)
        ElMessage.error('更新事件失敗')
        info.revert()
      }
    }
    
    // 處理事件調整大小
    const handleEventResize = async (info) => {
      try {
        const eventId = info.event.id
        const event = monthEvents.value.find(e => e.id === eventId)
        if (event) {
          const updatedEvent = {
            ...event,
            end: {
              dateTime: info.event.end.toISOString()
            }
          }
          await googleCalendarService.updateEvent('primary', eventId, updatedEvent)
          ElMessage.success('事件時間已更新')
          await loadCalendarData()
        }
      } catch (err) {
        console.error('更新事件失敗:', err)
        ElMessage.error('更新事件失敗')
        info.revert()
      }
    }
    
    // 顯示新增事件對話框
    const showAddEventDialog = () => {
      resetEventForm()
      addEventDialog.value = true
    }
    
    // 重置事件表單
    const resetEventForm = () => {
      eventForm.value = {
        summary: '',
        startTime: null,
        endTime: null,
        location: '',
        description: ''
      }
      currentEditEvent.value = null
    }
    
    // 建立事件
    const createEvent = async () => {
      try {
        creating.value = true
        
        const eventData = {
          summary: eventForm.value.summary,
          location: eventForm.value.location,
          description: eventForm.value.description,
          start: {
            dateTime: eventForm.value.startTime.toISOString()
          },
          end: {
            dateTime: eventForm.value.endTime.toISOString()
          }
        }
        
        await googleCalendarService.createEvent('primary', eventData)
        ElMessage.success('事件建立成功')
        addEventDialog.value = false
        await loadCalendarData()
        
      } catch (err) {
        console.error('建立事件失敗:', err)
        ElMessage.error('建立事件失敗')
      } finally {
        creating.value = false
      }
    }
    
    // 編輯事件
    const editEvent = (event) => {
      currentEditEvent.value = event
      eventForm.value = {
        summary: event.summary || '',
        startTime: new Date(event.start.dateTime || event.start.date),
        endTime: new Date(event.end.dateTime || event.end.date),
        location: event.location || '',
        description: event.description || ''
      }
      editEventDialog.value = true
    }
    
    // 更新事件
    const updateEvent = async () => {
      try {
        updating.value = true
        
        const eventData = {
          summary: eventForm.value.summary,
          location: eventForm.value.location,
          description: eventForm.value.description,
          start: {
            dateTime: eventForm.value.startTime.toISOString()
          },
          end: {
            dateTime: eventForm.value.endTime.toISOString()
          }
        }
        
        await googleCalendarService.updateEvent('primary', currentEditEvent.value.id, eventData)
        ElMessage.success('事件更新成功')
        editEventDialog.value = false
        await loadCalendarData()
        
      } catch (err) {
        console.error('更新事件失敗:', err)
        ElMessage.error('更新事件失敗')
      } finally {
        updating.value = false
      }
    }
    
    // 刪除事件確認
    const deleteEventConfirm = async (event) => {
      try {
        await ElMessageBox.confirm(
          `確定要刪除事件 "${event.summary}" 嗎？`,
          '刪除確認',
          {
            confirmButtonText: '確定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        await googleCalendarService.deleteEvent('primary', event.id)
        ElMessage.success('事件刪除成功')
        await loadCalendarData()
        
      } catch (err) {
        if (err !== 'cancel') {
          console.error('刪除事件失敗:', err)
          ElMessage.error('刪除事件失敗')
        }
      }
    }
    
    // 格式化事件時間
    const formatEventTime = (event) => {
      if (!event.start) return ''
      
      const start = new Date(event.start.dateTime || event.start.date)
      const end = new Date(event.end.dateTime || event.end.date)
      
      if (event.start.dateTime) {
        return `${start.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`
      } else {
        return '整天'
      }
    }
    
    // 格式化事件日期
    const formatEventDate = (event) => {
      if (!event.start) return ''
      
      const start = new Date(event.start.dateTime || event.start.date)
      return start.toLocaleDateString('zh-TW', { 
        month: '2-digit', 
        day: '2-digit',
        weekday: 'short'
      })
    }
    
    // 回到首頁
    const goHome = () => {
      router.push('/')
    }
    
    // 登出
    const logout = async () => {
      try {
        await googleAuthService.signOut(authStore.token)
        authStore.logout()
        ElMessage.success('已成功登出')
        router.push('/login')
      } catch (err) {
        console.error('登出失敗:', err)
        ElMessage.error('登出失敗')
      }
    }
    
    // 頁面關閉時自動登出
    const handlePageUnload = async () => {
      try {
        await googleAuthService.signOut(authStore.token)
        authStore.logout()
      } catch (err) {
        console.error('頁面關閉登出失敗:', err)
      }
    }
    
    // 組件載入時載入資料
    onMounted(() => {
      loadCalendarData()
      
      // 添加頁面關閉事件監聽器
      window.addEventListener('beforeunload', handlePageUnload)
    })
    
    // 組件卸載時移除事件監聽器
    onUnmounted(() => {
      window.removeEventListener('beforeunload', handlePageUnload)
    })
    
    return {
      authStore,
      loading,
      error,
      todayEvents,
      monthEvents,
      calendarRef,
      currentView,
      calendarOptions,
      addEventDialog,
      editEventDialog,
      creating,
      updating,
      eventForm,
      refreshCalendar,
      changeView,
      showAddEventDialog,
      resetEventForm,
      createEvent,
      editEvent,
      updateEvent,
      deleteEventConfirm,
      formatEventTime,
      formatEventDate,
      goHome,
      logout
    }
  }
}
</script>

<style scoped>
.calendar-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.calendar-header h2 {
  color: #333;
  margin: 0;
  font-size: 1.8em;
}

.user-greeting {
  color: #666;
  font-size: 0.9em;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.calendar-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* 載入和錯誤狀態 */
.loading-container, .error-container {
  background: white;
  border-radius: 10px;
  padding: 60px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.loading-container p, .error-container p {
  color: #666;
  font-size: 1.1em;
  margin: 20px 0;
}

/* 日曆包裝器 */
.calendar-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

/* 日曆控制項 */
.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.view-selector {
  display: flex;
  gap: 10px;
}

.calendar-actions {
  display: flex;
  gap: 10px;
}

/* 視圖按鈕樣式 */
.view-button {
  background: white !important;
  color: black !important;
  border: 1px solid #dcdfe6 !important;
}

.view-button:hover {
  background: #f5f7fa !important;
  color: black !important;
  border-color: #c0c4cc !important;
}

.view-button.active {
  background: white !important;
  color: black !important;
  border-color: #409eff !important;
  font-weight: 600;
}

/* FullCalendar 容器 */
.fullcalendar-container {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

:deep(.fc) {
  font-family: inherit;
}

:deep(.fc-toolbar-title) {
  color: #333;
  font-size: 1.5em;
  font-weight: 600;
}

:deep(.fc-button) {
  background: #409eff;
  border-color: #409eff;
}

:deep(.fc-button:hover) {
  background: #337ecc;
  border-color: #337ecc;
}

:deep(.fc-event) {
  border: none;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

:deep(.fc-daygrid-event) {
  margin: 1px;
}

/* 日曆資訊 */
.calendar-info {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.calendar-info h3 {
  color: #333;
  margin: 0 0 15px 0;
  font-size: 1.4em;
}

.calendar-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 5px;
}

.stat-value {
  color: #409eff;
  font-size: 1.8em;
  font-weight: bold;
}

/* 事件區塊 */
.today-events {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.today-events h4 {
  color: #333;
  margin: 0 0 15px 0;
  font-size: 1.2em;
}

.no-events {
  color: #999;
  text-align: center;
  padding: 20px;
  font-style: italic;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.event-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.event-time {
  min-width: 80px;
  color: #666;
  font-size: 0.9em;
  font-weight: 500;
}

.event-details {
  flex: 1;
}

.event-details h5 {
  color: #333;
  margin: 0 0 5px 0;
  font-size: 1em;
  font-weight: 600;
}

.event-details p {
  color: #666;
  margin: 2px 0;
  font-size: 0.9em;
}

.event-actions {
  margin-top: 10px;
  display: flex;
  gap: 5px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .header-left {
    text-align: center;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .calendar-controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .calendar-stats {
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }
  
  .event-item {
    flex-direction: column;
    gap: 10px;
  }
  
  .event-time {
    min-width: auto;
  }
}
</style>