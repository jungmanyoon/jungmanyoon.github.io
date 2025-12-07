import React from 'react'
import { Wifi, WifiOff, Cloud, CloudOff, Clock, Bell } from 'lucide-react'
import { useOfflineStatus } from '../../hooks/useOfflineStatus'
import { useBackgroundSync } from '../../utils/pwa/backgroundSync'
import { useNotifications } from '../../utils/pwa/notificationManager'

const PWAStatus = () => {
  const { isOnline, isOffline } = useOfflineStatus()
  const { getSyncStatus } = useBackgroundSync()
  const { getActiveTimers, permission } = useNotifications()
  
  const syncStatus = getSyncStatus()
  const activeTimers = getActiveTimers()

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="flex flex-col space-y-2">
        {/* 연결 상태 */}
        <div className={`flex items-center px-3 py-2 rounded-full text-xs font-medium shadow-md transition-all duration-300 ${
          isOnline 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 mr-1.5" />
              온라인
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 mr-1.5" />
              오프라인
            </>
          )}
        </div>

        {/* 동기화 상태 */}
        {syncStatus.queueLength > 0 && (
          <div className="flex items-center px-3 py-2 rounded-full text-xs font-medium shadow-md bg-blue-100 text-blue-800 border border-blue-200">
            {isOnline ? (
              <Cloud className="w-3 h-3 mr-1.5" />
            ) : (
              <CloudOff className="w-3 h-3 mr-1.5" />
            )}
            동기화 대기 {syncStatus.queueLength}개
          </div>
        )}

        {/* 활성 타이머 */}
        {activeTimers.length > 0 && (
          <div className="flex items-center px-3 py-2 rounded-full text-xs font-medium shadow-md bg-orange-100 text-orange-800 border border-orange-200">
            <Clock className="w-3 h-3 mr-1.5" />
            타이머 {activeTimers.length}개
          </div>
        )}

        {/* 알림 권한 상태 */}
        {permission === 'granted' && (
          <div className="flex items-center px-3 py-2 rounded-full text-xs font-medium shadow-md bg-purple-100 text-purple-800 border border-purple-200">
            <Bell className="w-3 h-3 mr-1.5" />
            알림 활성
          </div>
        )}
      </div>
    </div>
  )
}

export default PWAStatus