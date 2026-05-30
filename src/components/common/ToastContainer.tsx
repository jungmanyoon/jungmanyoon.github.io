/**
 * Toast Container Component
 * Renders all active toasts in a fixed position
 */

import React from 'react'
import { useToastStore } from '@stores/useToastStore'
import { Toast } from './Toast'

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)
  const pauseToast = useToastStore((state) => state.pauseToast)
  const resumeToast = useToastStore((state) => state.resumeToast)

  if (toasts.length === 0) {
    return null
  }

  return (
    <div
      // 접근성: 알림 영역 표식 + 일반 알림은 polite로 보조기기에 전달
      // (error 토스트는 개별 Toast에서 role="alert"/assertive로 즉시 안내)
      role="region"
      aria-live="polite"
      aria-label="알림"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            toast={toast}
            onDismiss={removeToast}
            onPause={pauseToast}
            onResume={resumeToast}
          />
        </div>
      ))}
    </div>
  )
}
