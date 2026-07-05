/**
 * BakingMode - 전용 베이킹 모드 (H1)
 *
 * 굽는 동안 손이 자유롭지 않은 주방 환경을 위한 전체화면 단계 뷰.
 * - navigator.wakeLock 으로 화면이 꺼지지 않게 유지 (미지원/거부 시 조용히 무시)
 * - 한 단계씩 큰 글씨로 표시, 이전/다음 네비 + 완료 체크 + 시간/온도 배지
 * - Escape/좌우 화살표 키 지원
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ChevronLeft, ChevronRight, Check, Clock, ThermometerSun, ChefHat } from 'lucide-react'

export interface BakingStep {
  id: string
  description: string
  time?: number
  temp?: number
  phase?: string
}

interface BakingModeProps {
  isOpen: boolean
  onClose: () => void
  steps: BakingStep[]
  recipeName?: string
  translateStep?: (s: string) => string
  completed: Set<string>
  onToggleDone: (id: string) => void
}

export default function BakingMode({
  isOpen,
  onClose,
  steps,
  recipeName,
  translateStep,
  completed,
  onToggleDone,
}: BakingModeProps) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const wakeRef = useRef<any>(null)

  // 열릴 때: 첫 미완료 단계로 이동
  useEffect(() => {
    if (!isOpen) return
    const firstUndone = steps.findIndex(s => !completed.has(s.id))
    setIndex(firstUndone >= 0 ? firstUndone : 0)
    // steps/completed 는 의도적으로 deps 제외 (완료 토글 시 위치가 튀지 않도록)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Wake Lock: 화면 유지 (탭 복귀 시 재요청)
  useEffect(() => {
    if (!isOpen) return
    let released = false
    const request = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeRef.current = await (navigator as any).wakeLock.request('screen')
        }
      } catch {
        /* 미지원/권한거부: 조용히 무시 (베이킹 모드 자체는 정상 동작) */
      }
    }
    request()
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !released) request()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      released = true
      document.removeEventListener('visibilitychange', onVisible)
      try { wakeRef.current?.release?.() } catch { /* noop */ }
      wakeRef.current = null
    }
  }, [isOpen])

  const goPrev = useCallback(() => setIndex(i => Math.max(0, i - 1)), [])
  const goNext = useCallback(() => setIndex(i => Math.min(steps.length - 1, i + 1)), [steps.length])

  // 키보드: Esc 닫기 / 좌우 이동
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose, goNext, goPrev])

  if (!isOpen) return null

  const title = recipeName?.trim() || t('advDashboard.bakingMode.title', { defaultValue: '베이킹 모드' })

  // 공정이 없을 때
  if (steps.length === 0) {
    return (
      <div className="fixed inset-0 z-[60] bg-surface-canvas flex flex-col items-center justify-center gap-4 p-6 text-center">
        <ChefHat className="w-12 h-12 text-ink-disabled" />
        <p className="text-lg text-ink-muted">{t('advDashboard.bakingMode.noSteps', { defaultValue: '등록된 공정이 없습니다.' })}</p>
        <button
          onClick={onClose}
          className="min-h-[48px] px-6 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600"
        >
          {t('common.close', { defaultValue: '닫기' })}
        </button>
      </div>
    )
  }

  const step = steps[Math.min(index, steps.length - 1)]
  const isDone = completed.has(step.id)
  const doneCount = steps.filter(s => completed.has(s.id)).length
  const text = translateStep ? translateStep(step.description || '') : (step.description || '')
  const isLast = index >= steps.length - 1

  return (
    <div className="fixed inset-0 z-[60] bg-surface-canvas flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <ChefHat className="w-5 h-5 text-brand-600 flex-shrink-0" />
          <span className="font-semibold text-ink truncate">{title}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm text-ink-muted tabular-nums">
            {index + 1} / {steps.length} · {t('advDashboard.bakingMode.doneN', { defaultValue: '{{n}} 완료', n: doneCount })}
          </span>
          <button
            onClick={onClose}
            aria-label={t('common.close', { defaultValue: '닫기' })}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-surface-muted"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="h-1.5 bg-line flex-shrink-0" aria-hidden="true">
        <div
          className="h-full bg-brand-500 transition-all duration-300"
          style={{ width: `${((index + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* 본문: 큰 글씨 단계 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center overflow-auto">
        <div className="text-brand-600 font-bold text-xl sm:text-2xl mb-5">
          {t('advDashboard.bakingMode.step', { defaultValue: '단계' })} {index + 1}
        </div>
        <p className={`max-w-3xl text-2xl sm:text-4xl md:text-5xl leading-relaxed font-medium ${isDone ? 'line-through text-ink-disabled' : 'text-ink'}`}>
          {text || <span className="text-ink-disabled">—</span>}
        </p>

        {/* 시간/온도 배지 */}
        {(step.time || step.temp) && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {step.time ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xl sm:text-2xl font-semibold">
                <Clock className="w-6 h-6" />{step.time}{t('units.minute', { defaultValue: '분' })}
              </span>
            ) : null}
            {step.temp ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 text-orange-700 text-xl sm:text-2xl font-semibold">
                <ThermometerSun className="w-6 h-6" />{step.temp}{t('units.celsius', { defaultValue: '°C' })}
              </span>
            ) : null}
          </div>
        )}

        {/* 완료 토글 */}
        <button
          onClick={() => onToggleDone(step.id)}
          className={`mt-10 inline-flex items-center gap-2 min-h-[52px] px-6 rounded-xl text-lg font-semibold transition-colors ${
            isDone
              ? 'bg-success/10 text-success border-2 border-success'
              : 'bg-surface-muted text-ink-muted border-2 border-line hover:border-line-strong'
          }`}
        >
          <Check className="w-6 h-6" />
          {isDone
            ? t('advDashboard.bakingMode.undone', { defaultValue: '완료 취소' })
            : t('advDashboard.bakingMode.markDone', { defaultValue: '완료 표시' })}
        </button>
      </div>

      {/* 하단 네비게이션 (큰 터치 타깃) */}
      <div className="flex items-center justify-between gap-3 px-4 py-4 border-t border-line flex-shrink-0">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="inline-flex items-center gap-1 min-h-[56px] px-6 rounded-xl text-lg font-medium bg-surface-muted text-ink hover:bg-line disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-6 h-6" />
          {t('advDashboard.bakingMode.prev', { defaultValue: '이전' })}
        </button>
        <button
          onClick={() => (isLast ? onClose() : goNext())}
          className="inline-flex items-center gap-1 min-h-[56px] px-8 rounded-xl text-lg font-semibold bg-brand-500 text-white hover:bg-brand-600"
        >
          {isLast ? (
            <>{t('advDashboard.bakingMode.finish', { defaultValue: '끝내기' })}<Check className="w-6 h-6" /></>
          ) : (
            <>{t('advDashboard.bakingMode.next', { defaultValue: '다음' })}<ChevronRight className="w-6 h-6" /></>
          )}
        </button>
      </div>
    </div>
  )
}
