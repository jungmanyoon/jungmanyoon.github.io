/**
 * AdModal - 감사 모달 컴포넌트
 * 레시피 10개 초과 시 새 레시피 생성 전에 표시
 *
 * Google AdSense 정책 준수:
 * - 모달/팝업에 광고 표시 금지
 * - 강제 카운트다운/대기 시간 제거
 * - 사용자가 즉시 닫기 가능
 */

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Heart, Sparkles } from 'lucide-react'

interface AdModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  countdownSeconds?: number // 더 이상 사용하지 않음 (호환성 유지)
}

export default function AdModal({
  isOpen,
  onClose,
  onComplete,
}: AdModalProps) {
  const { t } = useTranslation()

  const handleComplete = useCallback(() => {
    onComplete()
    onClose()
  }, [onComplete, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 - 클릭시 닫기 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleComplete}
      />

      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-bread-500 to-amber-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-white" />
              <span className="text-white font-medium">{t('adModal.thankYouTitle')}</span>
            </div>
            <button
              onClick={handleComplete}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 감사 메시지 영역 */}
        <div className="p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-500" />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {t('adModal.thankYouMessage')}
          </h3>

          <p className="text-gray-600 text-sm mb-4">
            {t('adModal.supportMessage')}
          </p>

          {/* 레시피 개수 안내 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-amber-700 text-sm">
              {t('adModal.recipeCountInfo')}
            </p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="px-6 pb-6">
          <button
            onClick={handleComplete}
            className="w-full py-3 rounded-lg font-medium transition-all bg-bread-600 text-white hover:bg-bread-700 active:scale-[0.98]"
          >
            {t('adModal.continueCreating')}
          </button>
        </div>
      </div>
    </div>
  )
}
