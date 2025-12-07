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

  if (toasts.length === 0) {
    return null
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-label="알림"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={removeToast} />
        </div>
      ))}
    </div>
  )
}
