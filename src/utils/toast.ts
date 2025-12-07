/**
 * Toast Utility Functions
 * Convenient helper functions for showing toast notifications
 */

import { useToastStore } from '@stores/useToastStore'
import type { Toast, ToastAction } from '@stores/useToastStore'

type ToastOptions = {
  duration?: number
  action?: ToastAction
}

/**
 * Toast helper functions for easy usage throughout the app
 */
export const toast = {
  /**
   * Show success toast
   */
  success: (message: string, options?: ToastOptions): string => {
    return useToastStore.getState().addToast({
      type: 'success',
      message,
      duration: options?.duration,
      action: options?.action
    })
  },

  /**
   * Show error toast
   */
  error: (message: string, options?: ToastOptions): string => {
    return useToastStore.getState().addToast({
      type: 'error',
      message,
      duration: options?.duration ?? 5000, // Errors stay longer by default
      action: options?.action
    })
  },

  /**
   * Show warning toast
   */
  warning: (message: string, options?: ToastOptions): string => {
    return useToastStore.getState().addToast({
      type: 'warning',
      message,
      duration: options?.duration ?? 4000,
      action: options?.action
    })
  },

  /**
   * Show info toast
   */
  info: (message: string, options?: ToastOptions): string => {
    return useToastStore.getState().addToast({
      type: 'info',
      message,
      duration: options?.duration,
      action: options?.action
    })
  },

  /**
   * Show custom toast
   */
  custom: (toast: Omit<Toast, 'id'>): string => {
    return useToastStore.getState().addToast(toast)
  },

  /**
   * Remove specific toast
   */
  dismiss: (id: string): void => {
    useToastStore.getState().removeToast(id)
  },

  /**
   * Clear all toasts
   */
  dismissAll: (): void => {
    useToastStore.getState().clearAll()
  }
}
