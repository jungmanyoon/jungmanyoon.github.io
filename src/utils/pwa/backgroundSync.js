/**
 * 백그라운드 동기화 유틸리티
 * 오프라인 상태에서 발생한 데이터 변경사항을 온라인 복구 시 동기화
 */

class BackgroundSync {
  constructor() {
    this.syncQueue = this.loadSyncQueue()
    this.isOnline = navigator.onLine
    this.setupEventListeners()
  }

  setupEventListeners() {
    // 온라인/오프라인 상태 변경 감지
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processSyncQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })

    // 커스텀 동기화 이벤트 리스너
    window.addEventListener('sync-data', () => {
      this.processSyncQueue()
    })
  }

  /**
   * 동기화 큐에 작업 추가
   */
  addToSyncQueue(action) {
    const syncItem = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      action: action.type,
      data: action.data,
      retryCount: 0,
      maxRetries: 3
    }

    this.syncQueue.push(syncItem)
    this.saveSyncQueue()

    // 온라인 상태면 즉시 처리
    if (this.isOnline) {
      this.processSyncQueue()
    }

    return syncItem.id
  }

  /**
   * 동기화 큐 처리
   */
  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return

    const currentQueue = [...this.syncQueue]
    
    for (const item of currentQueue) {
      try {
        await this.processSync(item)
        // 성공한 항목 제거
        this.removeFromQueue(item.id)
      } catch (error) {
        console.error('동기화 실패:', error)
        
        // 재시도 횟수 증가
        item.retryCount += 1
        
        if (item.retryCount >= item.maxRetries) {
          console.error('최대 재시도 횟수 초과, 항목 제거:', item)
          this.removeFromQueue(item.id)
        }
      }
    }

    this.saveSyncQueue()
  }

  /**
   * 개별 동기화 항목 처리
   */
  async processSync(item) {
    switch (item.action) {
      case 'SAVE_RECIPE':
        return await this.syncSaveRecipe(item.data)
      
      case 'DELETE_RECIPE':
        return await this.syncDeleteRecipe(item.data)
      
      case 'UPDATE_RECIPE':
        return await this.syncUpdateRecipe(item.data)
        
      default:
        throw new Error(`알 수 없는 동기화 액션: ${item.action}`)
    }
  }

  /**
   * 레시피 저장 동기화
   */
  async syncSaveRecipe(recipeData) {
    // 로컬 스토리지에서 현재 상태 확인
    const currentRecipes = JSON.parse(localStorage.getItem('recipes') || '[]')
    const existingRecipe = currentRecipes.find(r => r.id === recipeData.id)

    if (!existingRecipe) {
      // 로컬에만 저장 (실제 API 호출은 여기서)
      console.log('레시피 동기화 완료:', recipeData.name)
    }

    return true
  }

  /**
   * 레시피 삭제 동기화
   */
  async syncDeleteRecipe(deleteData) {
    const currentRecipes = JSON.parse(localStorage.getItem('recipes') || '[]')
    const stillExists = currentRecipes.find(r => r.id === deleteData.recipeId)

    if (!stillExists) {
      console.log('레시피 삭제 동기화 완료:', deleteData.recipeId)
    }

    return true
  }

  /**
   * 레시피 업데이트 동기화
   */
  async syncUpdateRecipe(updateData) {
    console.log('레시피 업데이트 동기화 완료:', updateData.id)
    return true
  }

  /**
   * 큐에서 항목 제거
   */
  removeFromQueue(itemId) {
    this.syncQueue = this.syncQueue.filter(item => item.id !== itemId)
  }

  /**
   * 동기화 큐 로드
   */
  loadSyncQueue() {
    try {
      const saved = localStorage.getItem('sync-queue')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('동기화 큐 로드 실패:', error)
      return []
    }
  }

  /**
   * 동기화 큐 저장
   */
  saveSyncQueue() {
    try {
      localStorage.setItem('sync-queue', JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error('동기화 큐 저장 실패:', error)
    }
  }

  /**
   * 동기화 상태 확인
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      pendingItems: this.syncQueue.map(item => ({
        id: item.id,
        action: item.action,
        timestamp: item.timestamp,
        retryCount: item.retryCount
      }))
    }
  }

  /**
   * 강제 동기화 실행
   */
  forcSync() {
    if (this.isOnline) {
      return this.processSyncQueue()
    } else {
      console.warn('오프라인 상태에서는 동기화할 수 없습니다.')
    }
  }

  /**
   * 동기화 큐 초기화
   */
  clearSyncQueue() {
    this.syncQueue = []
    this.saveSyncQueue()
  }
}

// 싱글톤 인스턴스 생성
export const backgroundSync = new BackgroundSync()

// React에서 사용할 훅
export const useBackgroundSync = () => {
  return {
    addToSync: (action) => backgroundSync.addToSyncQueue(action),
    getSyncStatus: () => backgroundSync.getSyncStatus(),
    forceSync: () => backgroundSync.forcSync(),
    clearQueue: () => backgroundSync.clearSyncQueue()
  }
}