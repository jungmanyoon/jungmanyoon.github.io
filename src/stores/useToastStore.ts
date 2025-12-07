/**
 * Toast Notification Store
 * Zustand store for managing toast notifications
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number  // milliseconds, default 3000
  action?: ToastAction
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearAll: () => void
}

export const useToastStore = create<ToastStore>()(
  devtools(
    (set, get) => ({
      toasts: [],

      addToast: (toast: Omit<Toast, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const duration = toast.duration ?? 3000

        const newToast: Toast = {
          ...toast,
          id,
          duration
        }

        set((state) => ({
          toasts: [...state.toasts, newToast]
        }))

        // Auto-dismiss after duration
        if (duration > 0) {
          setTimeout(() => {
            get().removeToast(id)
          }, duration)
        }

        return id
      },

      removeToast: (id: string) => {
        set((state) => ({
          toasts: state.toasts.filter(toast => toast.id !== id)
        }))
      },

      clearAll: () => {
        set({ toasts: [] })
      }
    }),
    {
      name: 'ToastStore'
    }
  )
)
