/**
 * Zustand 앱 전역 스토어
 * 앱 상태, 설정, 히스토리 관리
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { 
  AppState, 
  TabType, 
  ErrorState, 
  UserPreferences, 
  HistoryItem 
} from '@types/store.types'

const initialPreferences: UserPreferences = {
  language: 'ko',
  theme: 'light',
  defaultUnit: {
    weight: 'g',
    temperature: 'C'
  },
  showTips: true,
  autoSave: true,
  precisionLevel: 1
}

interface AppStore extends AppState {
  // 액션
  setActiveTab: (tab: TabType) => void
  setLoading: (loading: boolean) => void
  setError: (error: ErrorState | null) => void
  clearError: () => void
  updatePreferences: (prefs: Partial<UserPreferences>) => void
  resetPreferences: () => void
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
  toggleFavorite: (id: string) => void
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 상태
        activeTab: 'recipes',
        isLoading: false,
        error: null,
        userPreferences: initialPreferences,
        history: [],
        maxHistorySize: 50,

        // 액션
        setActiveTab: (tab: TabType, pushHistory: boolean = true) => {
          set({ activeTab: tab })
          // 브라우저 히스토리에 상태 푸시 (뒤로가기 지원)
          if (pushHistory && typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.hash = tab
            window.history.pushState({ tab }, '', url.toString())
          }
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading })
        },

        setError: (error: ErrorState | null) => {
          set({ error })
        },

        clearError: () => {
          set({ error: null })
        },

        updatePreferences: (prefs: Partial<UserPreferences>) => {
          set((state) => ({
            userPreferences: { ...state.userPreferences, ...prefs }
          }))
        },

        resetPreferences: () => {
          set({ userPreferences: initialPreferences })
        },

        addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
          const id = `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const newItem: HistoryItem = {
            ...item,
            id,
            timestamp: new Date(),
            isFavorite: false
          }

          set((state) => {
            let history = [newItem, ...state.history]
            
            // 최대 크기 제한
            if (history.length > state.maxHistorySize) {
              // 즐겨찾기가 아닌 오래된 항목부터 제거
              const nonFavorites = history.filter(h => !h.isFavorite)
              const favorites = history.filter(h => h.isFavorite)
              
              if (nonFavorites.length > state.maxHistorySize - favorites.length) {
                history = [
                  ...favorites,
                  ...nonFavorites.slice(0, state.maxHistorySize - favorites.length)
                ]
              }
            }
            
            return { history }
          })
        },

        removeFromHistory: (id: string) => {
          set((state) => ({
            history: state.history.filter(item => item.id !== id)
          }))
        },

        clearHistory: () => {
          set((state) => ({
            // 즐겨찾기만 유지
            history: state.history.filter(item => item.isFavorite)
          }))
        },

        toggleFavorite: (id: string) => {
          set((state) => ({
            history: state.history.map(item =>
              item.id === id 
                ? { ...item, isFavorite: !item.isFavorite }
                : item
            )
          }))
        }
      }),
      {
        name: 'app-store',
        partialize: (state) => ({
          userPreferences: state.userPreferences,
          history: state.history
        })
      }
    ),
    {
      name: 'AppStore'
    }
  )
)

// 선택자
export const selectFavoriteHistory = (state: AppStore) => 
  state.history.filter(item => item.isFavorite)

export const selectRecentHistory = (state: AppStore, limit: number = 10) => 
  state.history.slice(0, limit)

export const selectHistoryByType = (state: AppStore, type: 'calculation' | 'conversion') =>
  state.history.filter(item => item.type === type)