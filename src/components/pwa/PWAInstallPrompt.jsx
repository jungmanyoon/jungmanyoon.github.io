import React, { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // 이미 설치되었는지 확인
    const checkIfStandalone = () => {
      const isStandaloneCheck = window.matchMedia('(display-mode: standalone)').matches ||
                               window.navigator.standalone === true ||
                               document.referrer.includes('android-app://')
      setIsStandalone(isStandaloneCheck)
    }

    checkIfStandalone()

    // PWA 설치 가능 이벤트 리스너
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // 사용자가 이전에 설치를 거부했는지 확인
      const installPromptDismissed = localStorage.getItem('pwa-install-dismissed')
      const lastDismissed = localStorage.getItem('pwa-install-last-dismissed')
      
      // 7일 후에 다시 표시
      const daysSinceLastDismissed = lastDismissed ? 
        (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24) : 999
      
      if (!installPromptDismissed || daysSinceLastDismissed > 7) {
        setShowInstallPrompt(true)
      }
    }

    // PWA 설치 완료 이벤트
    const handleAppInstalled = () => {
      console.log('PWA가 설치되었습니다')
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      localStorage.removeItem('pwa-install-dismissed')
      localStorage.removeItem('pwa-install-last-dismissed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      // 설치 프롬프트 표시
      deferredPrompt.prompt()
      
      // 사용자 선택 대기
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('사용자가 PWA 설치를 수락했습니다')
      } else {
        console.log('사용자가 PWA 설치를 거부했습니다')
      }
      
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('PWA 설치 중 오류:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
    localStorage.setItem('pwa-install-last-dismissed', Date.now().toString())
  }

  // 이미 설치된 경우나 설치 불가능한 환경에서는 표시하지 않음
  if (isStandalone || !showInstallPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="bg-amber-100 rounded-full p-2 mr-3">
              <Smartphone className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                앱으로 설치하기
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                더 빠르고 편리하게 사용하세요
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            설치하기
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-md transition-colors"
          >
            나중에
          </button>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallPrompt