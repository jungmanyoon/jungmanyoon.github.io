/**
 * Toast Component
 * Individual toast notification with animations and accessibility
 */

import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import type { Toast as ToastType } from '@stores/useToastStore'

interface ToastProps {
  toast: ToastType
  onDismiss: (id: string) => void
}

const ICON_MAP = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info
}

const STYLE_MAP = {
  success: {
    bg: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    text: 'text-green-900',
    button: 'text-green-700 hover:text-green-900'
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    text: 'text-red-900',
    button: 'text-red-700 hover:text-red-900'
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-600',
    text: 'text-amber-900',
    button: 'text-amber-700 hover:text-amber-900'
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-900',
    button: 'text-blue-700 hover:text-blue-900'
  }
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const Icon = ICON_MAP[toast.type]
  const styles = STYLE_MAP[toast.type]

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      setIsVisible(true)
    })
  }, [])

  const handleDismiss = () => {
    setIsLeaving(true)
    // Wait for exit animation before removing
    setTimeout(() => {
      onDismiss(toast.id)
    }, 300)
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
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
        aria-label="닫기"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
