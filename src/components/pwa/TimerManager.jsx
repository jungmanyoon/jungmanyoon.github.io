import React, { useState, useEffect } from 'react'
import { Clock, Play, Pause, X, Plus, Timer } from 'lucide-react'
import { useNotifications } from '../../utils/pwa/notificationManager'

const TimerManager = ({ isOpen, onClose, seed = null }) => {
  const [activeTimers, setActiveTimers] = useState([])
  const [newTimerName, setNewTimerName] = useState('')
  const [newTimerMinutes, setNewTimerMinutes] = useState('')
  const [newTimerType, setNewTimerType] = useState('baking')

  // 공정 등에서 넘어온 프리필(seed)로 새 타이머 입력폼을 채움 (모달 열릴 때)
  useEffect(() => {
    if (isOpen && seed) {
      setNewTimerName(seed.name || '')
      setNewTimerMinutes(seed.minutes ? String(seed.minutes) : '')
      setNewTimerType('baking')
    }
  }, [isOpen, seed])
  
  const {
    setBakingTimer,
    setFermentationTimer,
    removeTimer,
    extendTimer,
    getActiveTimers,
    requestPermission,
    permission,
    isSupported
  } = useNotifications()

  // 타이머 상태 업데이트
  useEffect(() => {
    if (!isOpen) return

    const updateTimers = () => {
      setActiveTimers(getActiveTimers())
    }

    updateTimers()
    const interval = setInterval(updateTimers, 1000)

    return () => clearInterval(interval)
    // getActiveTimers는 useNotifications가 렌더마다 새 참조를 반환하므로 의존성에서 제외한다.
    // (포함 시 setActiveTimers -> 리렌더 -> 새 getActiveTimers -> 재실행의 무한 루프가 됨)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleAddTimer = async () => {
    if (!newTimerName.trim() || !newTimerMinutes) return

    // 알림 권한 요청
    if (permission !== 'granted') {
      const granted = await requestPermission()
      if (!granted) {
        alert('알림 권한이 필요합니다.')
        return
      }
    }

    const minutes = parseInt(newTimerMinutes)
    const name = newTimerName.trim()

    if (newTimerType === 'fermentation') {
      setFermentationTimer(name, minutes / 60)
    } else {
      setBakingTimer(name, minutes)
    }

    // 입력 폼 초기화
    setNewTimerName('')
    setNewTimerMinutes('')
    
    // 타이머 목록 업데이트
    setActiveTimers(getActiveTimers())
  }

  const handleRemoveTimer = (timerId) => {
    removeTimer(timerId)
    setActiveTimers(getActiveTimers())
  }

  const handleExtendTimer = (timerId) => {
    const extension = newTimerType === 'fermentation' ? 30 : 5 // 발효: 30분, 베이킹: 5분
    extendTimer(timerId, extension)
    setActiveTimers(getActiveTimers())
  }

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes}분`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}시간 ${remainingMinutes}분`
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-surface-paper rounded-lg shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <Timer className="w-5 h-5 mr-2 text-orange-600" />
            <h2 className="text-lg font-semibold text-ink">타이머 관리</h2>
          </div>
          <button
            onClick={onClose}
            className="text-ink-disabled hover:text-ink-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 알림 지원 안내 */}
          {!isSupported && (
            <div className="p-4 bg-yellow-50 border-b">
              <p className="text-sm text-yellow-800">
                이 브라우저는 알림을 지원하지 않습니다.
              </p>
            </div>
          )}

          {/* 새 타이머 추가 */}
          <div className="p-4 border-b bg-surface-muted">
            <h3 className="text-sm font-medium text-ink-muted mb-3">새 타이머 추가</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">
                  타이머 이름
                </label>
                <input
                  type="text"
                  value={newTimerName}
                  onChange={(e) => setNewTimerName(e.target.value)}
                  placeholder="예: 바게트 굽기"
                  className="w-full px-3 py-2 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-ink-muted mb-1">
                    시간 (분)
                  </label>
                  <input
                    type="number"
                    value={newTimerMinutes}
                    onChange={(e) => setNewTimerMinutes(e.target.value)}
                    placeholder="30"
                    min="1"
                    max="1440"
                    className="w-full px-3 py-2 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-medium text-ink-muted mb-1">
                    종류
                  </label>
                  <select
                    value={newTimerType}
                    onChange={(e) => setNewTimerType(e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  >
                    <option value="baking">베이킹</option>
                    <option value="fermentation">발효</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAddTimer}
                disabled={!newTimerName.trim() || !newTimerMinutes}
                className="w-full flex items-center justify-center px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-line-strong text-white text-sm font-medium rounded-md transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                타이머 추가
              </button>
            </div>
          </div>

          {/* 활성 타이머 목록 */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-ink-muted mb-3">
              활성 타이머 ({activeTimers.length}개)
            </h3>

            {activeTimers.length === 0 ? (
              <div className="text-center py-8 text-ink-subtle">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">활성 타이머가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTimers.map((timer) => (
                  <div
                    key={timer.id}
                    className="flex items-center justify-between p-3 bg-surface-paper border border-line rounded-lg shadow-sm"
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          timer.type === 'fermentation' ? 'bg-green-400' : 'bg-orange-400'
                        }`} />
                        <h4 className="font-medium text-ink text-sm">
                          {timer.name}
                        </h4>
                      </div>
                      <p className="text-xs text-ink-subtle mt-1">
                        남은 시간: {formatTime(timer.remainingMinutes)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleExtendTimer(timer.id)}
                        className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                        title={`${timer.type === 'fermentation' ? '30분' : '5분'} 연장`}
                      >
                        +{timer.type === 'fermentation' ? '30m' : '5m'}
                      </button>
                      <button
                        onClick={() => handleRemoveTimer(timer.id)}
                        className="text-ink-disabled hover:text-red-600 transition-colors"
                        title="타이머 제거"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimerManager