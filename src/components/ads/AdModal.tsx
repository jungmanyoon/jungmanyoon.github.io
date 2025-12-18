/**
 * AdModal - 광고 모달 컴포넌트
 * 레시피 10개 초과 시 새 레시피 생성 전에 표시
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface AdModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  countdownSeconds?: number
}

export default function AdModal({
  isOpen,
  onClose,
  onComplete,
  countdownSeconds = 5
}: AdModalProps) {
  const { t } = useTranslation()
  const [countdown, setCountdown] = useState(countdownSeconds)
  const [canClose, setCanClose] = useState(false)

  // 카운트다운 타이머
  useEffect(() => {
    if (!isOpen) {
      setCountdown(countdownSeconds)
      setCanClose(false)
      return
    }

    if (countdown <= 0) {
      setCanClose(true)
      return
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, countdown, countdownSeconds])

  // AdSense 광고 로드
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (e) {
        console.log('AdSense ad load error:', e)
      }
    }
  }, [isOpen])

  const handleComplete = useCallback(() => {
    if (canClose) {
      onComplete()
      onClose()
    }
  }, [canClose, onComplete, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={canClose ? handleComplete : undefined}
      />

      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-bread-500 to-amber-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white font-medium">{t('adModal.title')}</span>
            </div>
            {!canClose && (
              <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                {countdown}{t('adModal.seconds')}
              </span>
            )}
          </div>
        </div>

        {/* 광고 영역 */}
        <div className="p-6">
          <p className="text-center text-gray-600 text-sm mb-4">
            {t('adModal.message')}
          </p>

          {/* AdSense 광고 슬롯 */}
          <div className="bg-gray-100 rounded-lg min-h-[250px] flex items-center justify-center overflow-hidden">
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', height: '250px' }}
              data-ad-client="ca-pub-3535596450057181"
              data-ad-slot="auto"
              data-ad-format="rectangle"
              data-full-width-responsive="true"
            />
          </div>

          {/* 안내 메시지 */}
          <p className="text-center text-gray-400 text-xs mt-4">
            {t('adModal.info')}
          </p>
        </div>

        {/* 하단 버튼 */}
        <div className="px-6 pb-6">
          <button
            onClick={handleComplete}
            disabled={!canClose}
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              canClose
                ? 'bg-bread-600 text-white hover:bg-bread-700 active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canClose ? t('adModal.continue') : t('adModal.waitMessage', { seconds: countdown })}
          </button>
        </div>
      </div>
    </div>
  )
}
