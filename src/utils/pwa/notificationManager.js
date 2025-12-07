/**
 * 푸시 알림 관리자
 * 베이킹 타이머, 발효 알림 등 제과제빵 특화 알림 기능
 */

class NotificationManager {
  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator
    this.permission = this.isSupported ? Notification.permission : 'denied'
    this.activeTimers = new Map()
    
    // 페이지 로드 시 저장된 타이머 복원
    this.restoreTimers()
  }

  /**
   * 알림 권한 요청
   */
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('이 브라우저는 알림을 지원하지 않습니다.')
    }

    if (this.permission === 'granted') {
      return true
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    } catch (error) {
      console.error('알림 권한 요청 실패:', error)
      return false
    }
  }

  /**
   * 즉시 알림 표시
   */
  async showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission()
      if (!granted) return false
    }

    const defaultOptions = {
      icon: '/icon.svg',
      badge: '/icon.svg',
      lang: 'ko-KR',
      dir: 'ltr',
      requireInteraction: false,
      silent: false,
      ...options
    }

    try {
      // Service Worker를 통한 알림 (PWA에서 권장)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready
        return await registration.showNotification(title, defaultOptions)
      } else {
        // 일반 알림
        return new Notification(title, defaultOptions)
      }
    } catch (error) {
      console.error('알림 표시 실패:', error)
      return false
    }
  }

  /**
   * 베이킹 타이머 설정
   */
  setBakingTimer(name, minutes, options = {}) {
    const timerId = Date.now() + Math.random().toString(36).substr(2, 9)
    const endTime = Date.now() + (minutes * 60 * 1000)
    
    const timerData = {
      id: timerId,
      name,
      minutes,
      endTime,
      type: 'baking',
      ...options
    }

    // 타이머 저장
    this.activeTimers.set(timerId, timerData)
    this.saveTimers()

    // 실제 타이머 설정
    const timeoutId = setTimeout(() => {
      this.handleTimerComplete(timerData)
    }, minutes * 60 * 1000)

    timerData.timeoutId = timeoutId

    console.log(`베이킹 타이머 설정: ${name} - ${minutes}분`)
    return timerId
  }

  /**
   * 발효 타이머 설정
   */
  setFermentationTimer(name, hours, options = {}) {
    const minutes = hours * 60
    return this.setBakingTimer(name, minutes, {
      ...options,
      type: 'fermentation'
    })
  }

  /**
   * 타이머 완료 처리
   */
  async handleTimerComplete(timerData) {
    const { name, type } = timerData
    
    let title = ''
    let body = ''
    let actions = []

    if (type === 'baking') {
      title = '🔥 베이킹 완료!'
      body = `${name} 굽기가 완료되었습니다.`
      actions = [
        { action: 'check', title: '확인하기' },
        { action: 'extend', title: '5분 연장' }
      ]
    } else if (type === 'fermentation') {
      title = '🍞 발효 완료!'
      body = `${name} 발효가 완료되었습니다.`
      actions = [
        { action: 'check', title: '확인하기' },
        { action: 'extend', title: '30분 연장' }
      ]
    }

    await this.showNotification(title, {
      body,
      actions,
      requireInteraction: true,
      tag: `timer-${timerData.id}`,
      data: { timerId: timerData.id, type }
    })

    // 완료된 타이머 제거
    this.removeTimer(timerData.id)
  }

  /**
   * 타이머 제거
   */
  removeTimer(timerId) {
    const timer = this.activeTimers.get(timerId)
    if (timer && timer.timeoutId) {
      clearTimeout(timer.timeoutId)
    }
    
    this.activeTimers.delete(timerId)
    this.saveTimers()
  }

  /**
   * 타이머 연장
   */
  extendTimer(timerId, additionalMinutes) {
    const timer = this.activeTimers.get(timerId)
    if (!timer) return false

    // 기존 타이머 취소
    if (timer.timeoutId) {
      clearTimeout(timer.timeoutId)
    }

    // 새로운 종료 시간 계산
    timer.endTime = Date.now() + (additionalMinutes * 60 * 1000)
    
    // 새 타이머 설정
    const timeoutId = setTimeout(() => {
      this.handleTimerComplete(timer)
    }, additionalMinutes * 60 * 1000)

    timer.timeoutId = timeoutId
    this.saveTimers()

    console.log(`타이머 연장: ${timer.name} - ${additionalMinutes}분`)
    return true
  }

  /**
   * 활성 타이머 목록 조회
   */
  getActiveTimers() {
    const now = Date.now()
    const active = []

    for (const [id, timer] of this.activeTimers) {
      const remainingMs = timer.endTime - now
      
      if (remainingMs > 0) {
        active.push({
          id,
          name: timer.name,
          type: timer.type,
          remainingMinutes: Math.ceil(remainingMs / (60 * 1000)),
          endTime: timer.endTime
        })
      } else {
        // 만료된 타이머 제거
        this.removeTimer(id)
      }
    }

    return active
  }

  /**
   * 레시피 관련 알림 설정
   */
  async scheduleRecipeReminder(recipeName, steps) {
    const hasPermission = await this.requestPermission()
    if (!hasPermission) return false

    // 각 단계별 알림 설정
    steps.forEach((step, index) => {
      if (step.duration) {
        const minutes = step.duration.min || step.duration.max || 0
        
        setTimeout(() => {
          this.showNotification(`${recipeName} - ${step.action}`, {
            body: `단계 ${index + 1}: ${step.action}이 완료되었습니다.`,
            tag: `recipe-step-${index}`
          })
        }, minutes * 60 * 1000)
      }
    })

    return true
  }

  /**
   * 타이머 저장 (페이지 새로고침 시 복원용)
   */
  saveTimers() {
    const timersToSave = []
    
    for (const [id, timer] of this.activeTimers) {
      // timeoutId는 저장하지 않음 (복원 시 새로 생성)
      const { timeoutId, ...timerData } = timer
      timersToSave.push(timerData)
    }

    localStorage.setItem('active-timers', JSON.stringify(timersToSave))
  }

  /**
   * 저장된 타이머 복원
   */
  restoreTimers() {
    try {
      const saved = localStorage.getItem('active-timers')
      if (!saved) return

      const timers = JSON.parse(saved)
      const now = Date.now()

      timers.forEach(timer => {
        const remainingMs = timer.endTime - now
        
        if (remainingMs > 0) {
          // 아직 유효한 타이머 복원
          const timeoutId = setTimeout(() => {
            this.handleTimerComplete(timer)
          }, remainingMs)

          timer.timeoutId = timeoutId
          this.activeTimers.set(timer.id, timer)
        }
      })

      // 복원 후 다시 저장 (만료된 타이머 제거됨)
      this.saveTimers()
    } catch (error) {
      console.error('타이머 복원 실패:', error)
    }
  }

  /**
   * 모든 타이머 취소
   */
  cancelAllTimers() {
    for (const [id, timer] of this.activeTimers) {
      if (timer.timeoutId) {
        clearTimeout(timer.timeoutId)
      }
    }
    
    this.activeTimers.clear()
    this.saveTimers()
  }
}

// 싱글톤 인스턴스
export const notificationManager = new NotificationManager()

// React 훅
export const useNotifications = () => {
  return {
    requestPermission: () => notificationManager.requestPermission(),
    showNotification: (title, options) => notificationManager.showNotification(title, options),
    setBakingTimer: (name, minutes, options) => notificationManager.setBakingTimer(name, minutes, options),
    setFermentationTimer: (name, hours, options) => notificationManager.setFermentationTimer(name, hours, options),
    removeTimer: (id) => notificationManager.removeTimer(id),
    extendTimer: (id, minutes) => notificationManager.extendTimer(id, minutes),
    getActiveTimers: () => notificationManager.getActiveTimers(),
    cancelAllTimers: () => notificationManager.cancelAllTimers(),
    isSupported: notificationManager.isSupported,
    permission: notificationManager.permission
  }
}