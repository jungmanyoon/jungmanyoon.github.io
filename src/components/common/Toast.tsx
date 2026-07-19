/**
 * Toast Component
 * Individual toast notification with animations and accessibility
 */

import React, { useEffect, useRef, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import type { Toast as ToastType } from '@stores/useToastStore'

interface ToastProps {
  toast: ToastType
  onDismiss: (id: string) => void
  // hover 시 자동 dismiss 타이머 일시정지/재개 (store에서 주입)
  onPause?: (id: string) => void
  onResume?: (id: string) => void
}

const ICON_MAP = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info
}

const STYLE_MAP = {
  success: {
    bg: 'bg-success-50 border-success-100',
    icon: 'text-success-600',
    text: 'text-success-700',
    button: 'text-success-600 hover:text-success-700'
  },
  error: {
    bg: 'bg-danger-50 border-danger-100',
    icon: 'text-danger-600',
    text: 'text-danger-700',
    button: 'text-danger-600 hover:text-danger-700'
  },
  warning: {
    bg: 'bg-warning-50 border-warning-100',
    icon: 'text-warning-600',
    text: 'text-warning-700',
    button: 'text-warning-600 hover:text-warning-700'
  },
  info: {
    bg: 'bg-info-50 border-info-100',
    icon: 'text-info-600',
    text: 'text-info-700',
    button: 'text-info-600 hover:text-info-700'
  }
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss, onPause, onResume }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  // 닫기 애니메이션 타이머 핸들 (cleanup 대상)
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const Icon = ICON_MAP[toast.type]
  const styles = STYLE_MAP[toast.type]

  // error는 즉시 안내가 필요하므로 alert/assertive, 그 외에는 status/polite
  const isError = toast.type === 'error'
  const role = isError ? 'alert' : 'status'
  const ariaLive: 'assertive' | 'polite' = isError ? 'assertive' : 'polite'

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      setIsVisible(true)
    })
  }, [])

  // 언마운트 시 닫기 애니메이션 타이머 정리(메모리 누수 방지)
  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current)
        leaveTimerRef.current = null
      }
    }
  }, [])

  const handleDismiss = () => {
    setIsLeaving(true)
    // Wait for exit animation before removing
    leaveTimerRef.current = setTimeout(() => {
      onDismiss(toast.id)
    }, 300)
  }

  // hover/focus 시 자동 dismiss 타이머 일시정지, 벗어나면 재개
  const handlePause = () => {
    onPause?.(toast.id)
  }
  const handleResume = () => {
    onResume?.(toast.id)
  }

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onFocus={handlePause}
      onBlur={handleResume}
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-dropdown
        min-w-[320px] max-w-[480px]
        transition-all duration-300 ease-out
        ${styles.bg}
        ${
          isLeaving
            ? 'translate-x-[120%] opacity-0'
            : isVisible
            ? 'translate-x-0 opacity-100'
            : 'translate-x-[120%] opacity-0'
        }
      `}
    >
      {/* Icon */}
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.icon}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${styles.text}`}>
          {toast.message}
        </p>

        {/* Action Button */}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick()
              handleDismiss()
            }}
            className={`
              mt-2 text-sm font-semibold underline
              transition-colors
              ${styles.button}
            `}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={handleDismiss}
        className={`
          flex-shrink-0 p-1 rounded hover:bg-black/5
          transition-colors
          ${styles.icon}
        `}
        aria-label="알림 닫기"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
