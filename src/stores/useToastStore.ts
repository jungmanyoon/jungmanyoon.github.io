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
  pauseToast: (id: string) => void
  resumeToast: (id: string) => void
  clearAll: () => void
}

// 동시에 표시할 수 있는 최대 토스트 개수 (초과 시 오래된 것부터 제거)
const MAX_TOASTS = 4

// 동일 message+type 토스트가 이 시간(ms) 내에 이미 있으면 중복으로 간주
const DEDUPE_WINDOW_MS = 4000

/**
 * 자동 dismiss 타이머 관리 (store 외부 모듈 스코프).
 * - timerId: setTimeout 핸들
 * - remaining: 남은 시간(ms) - hover 일시정지 후 재개 시 사용
 * - startedAt: 현재 타이머가 시작된 시각(ms)
 * - createdAt: 토스트 최초 생성 시각(ms) - dedupe 판단용
 */
interface TimerEntry {
  timerId: ReturnType<typeof setTimeout>
  remaining: number
  startedAt: number
  createdAt: number
}

const timers = new Map<string, TimerEntry>()

// 지정한 토스트의 활성 타이머를 정리(메모리 누수 방지)
const clearTimer = (id: string) => {
  const entry = timers.get(id)
  if (entry) {
    clearTimeout(entry.timerId)
    timers.delete(id)
  }
}

export const useToastStore = create<ToastStore>()(
  devtools(
    (set, get) => ({
      toasts: [],

      addToast: (toast: Omit<Toast, 'id'>) => {
        const duration = toast.duration ?? 3000
        const now = Date.now()

        // 중복 방지: 동일 message+type 토스트가 dedupe 윈도우 내에 이미 있으면
        // 새로 추가하지 않고 기존 토스트를 갱신(타이머 리셋)한다.
        const existing = get().toasts.find(
          (t) => t.message === toast.message && t.type === toast.type
        )
        if (existing) {
          const entry = timers.get(existing.id)
          const createdAt = entry?.createdAt ?? now
          if (now - createdAt < DEDUPE_WINDOW_MS) {
            // 기존 토스트 내용 갱신(action 등) 후 자동 dismiss 타이머 재시작
            set((state) => ({
              toasts: state.toasts.map((t) =>
                t.id === existing.id
                  ? { ...t, ...toast, id: existing.id, duration }
                  : t
              )
            }))

            clearTimer(existing.id)
            if (duration > 0) {
              const timerId = setTimeout(() => {
                get().removeToast(existing.id)
              }, duration)
              timers.set(existing.id, {
                timerId,
                remaining: duration,
                startedAt: Date.now(),
                createdAt
              })
            }
            return existing.id
          }
        }

        const id = `toast-${now}-${Math.random().toString(36).substr(2, 9)}`

        const newToast: Toast = {
          ...toast,
          id,
          duration
        }

        set((state) => {
          const next = [...state.toasts, newToast]
          // 최대 개수 제한: 초과분은 오래된 것부터 제거(+ 타이머 정리)
          while (next.length > MAX_TOASTS) {
            const removed = next.shift()
            if (removed) {
              clearTimer(removed.id)
            }
          }
          return { toasts: next }
        })

        // Auto-dismiss after duration
        if (duration > 0) {
          const timerId = setTimeout(() => {
            get().removeToast(id)
          }, duration)
          timers.set(id, {
            timerId,
            remaining: duration,
            startedAt: Date.now(),
            createdAt: now
          })
        }

        return id
      },

      removeToast: (id: string) => {
        clearTimer(id)
        set((state) => ({
          toasts: state.toasts.filter(toast => toast.id !== id)
        }))
      },

      // hover 시작: 남은 시간을 계산해 보관하고 타이머 정지
      pauseToast: (id: string) => {
        const entry = timers.get(id)
        if (!entry) return
        clearTimeout(entry.timerId)
        const elapsed = Date.now() - entry.startedAt
        const remaining = Math.max(0, entry.remaining - elapsed)
        timers.set(id, { ...entry, remaining })
      },

      // hover 종료: 보관된 남은 시간으로 타이머 재개
      resumeToast: (id: string) => {
        const entry = timers.get(id)
        if (!entry) return
        // 남은 시간이 0 이하이면 즉시 제거
        if (entry.remaining <= 0) {
          get().removeToast(id)
          return
        }
        const timerId = setTimeout(() => {
          get().removeToast(id)
        }, entry.remaining)
        timers.set(id, { ...entry, timerId, startedAt: Date.now() })
      },

      clearAll: () => {
        // 모든 활성 타이머 정리(메모리 누수 방지)
        timers.forEach((entry) => clearTimeout(entry.timerId))
        timers.clear()
        set({ toasts: [] })
      }
    }),
    {
      name: 'ToastStore'
    }
  )
)
