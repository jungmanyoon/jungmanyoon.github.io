/**
 * 팬 프리셋 스토어
 * 자주 사용하는 팬 구성을 저장하고 불러오기
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PanConfig {
  id: string
  type: 'rectangle' | 'round' | 'loaf'
  length: number
  width: number
  height: number
  count: number
  productType: string
}

export interface PanPreset {
  id: string
  name: string
  pans: PanConfig[]
  createdAt: Date
  updatedAt: Date
  usageCount: number
  isFavorite: boolean
  tags: string[]
  notes?: string
}

interface PanPresetStore {
  presets: PanPreset[]

  // 프리셋 관리
  addPreset: (name: string, pans: PanConfig[], notes?: string) => void
  updatePreset: (id: string, updates: Partial<PanPreset>) => void
  deletePreset: (id: string) => void
  duplicatePreset: (id: string) => void

  // 즐겨찾기
  toggleFavorite: (id: string) => void

  // 사용 추적
  incrementUsage: (id: string) => void

  // 검색 & 필터
  getPresetById: (id: string) => PanPreset | undefined
  getFavorites: () => PanPreset[]
  getRecentlyUsed: (limit?: number) => PanPreset[]
  searchPresets: (query: string) => PanPreset[]

  // 태그 관리
  addTag: (id: string, tag: string) => void
  removeTag: (id: string, tag: string) => void
  getAllTags: () => string[]

  // 데이터 관리
  clearAll: () => void
  exportPresets: () => string
  importPresets: (data: string) => void
}

export const usePanPresetStore = create<PanPresetStore>()(
  persist(
    (set, get) => ({
      presets: [],

      addPreset: (name, pans, notes) => {
        const newPreset: PanPreset = {
          id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          pans: pans.map(pan => ({
            ...pan,
            id: pan.id || `pan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
          usageCount: 0,
          isFavorite: false,
          tags: [],
          notes
        }

        set(state => ({
          presets: [newPreset, ...state.presets]
        }))
      },

      updatePreset: (id, updates) => {
        set(state => ({
          presets: state.presets.map(preset =>
            preset.id === id
              ? { ...preset, ...updates, updatedAt: new Date() }
              : preset
          )
        }))
      },

      deletePreset: (id) => {
        set(state => ({
          presets: state.presets.filter(preset => preset.id !== id)
        }))
      },

      duplicatePreset: (id) => {
        const preset = get().getPresetById(id)
        if (preset) {
          get().addPreset(
            `${preset.name} (복사)`,
            preset.pans,
            preset.notes
          )
        }
      },

      toggleFavorite: (id) => {
        set(state => ({
          presets: state.presets.map(preset =>
            preset.id === id
              ? { ...preset, isFavorite: !preset.isFavorite }
              : preset
          )
        }))
      },

      incrementUsage: (id) => {
        set(state => ({
          presets: state.presets.map(preset =>
            preset.id === id
              ? { ...preset, usageCount: preset.usageCount + 1, updatedAt: new Date() }
              : preset
          )
        }))
      },

      getPresetById: (id) => {
        return get().presets.find(preset => preset.id === id)
      },

      getFavorites: () => {
        return get().presets.filter(preset => preset.isFavorite)
      },

      getRecentlyUsed: (limit = 5) => {
        return [...get().presets]
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, limit)
      },

      searchPresets: (query) => {
        const lowerQuery = query.toLowerCase()
        return get().presets.filter(preset =>
          preset.name.toLowerCase().includes(lowerQuery) ||
          preset.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
          preset.notes?.toLowerCase().includes(lowerQuery)
        )
      },

      addTag: (id, tag) => {
        set(state => ({
          presets: state.presets.map(preset =>
            preset.id === id && !preset.tags.includes(tag)
              ? { ...preset, tags: [...preset.tags, tag] }
              : preset
          )
        }))
      },

      removeTag: (id, tag) => {
        set(state => ({
          presets: state.presets.map(preset =>
            preset.id === id
              ? { ...preset, tags: preset.tags.filter(t => t !== tag) }
              : preset
          )
        }))
      },

      getAllTags: () => {
        const allTags = get().presets.flatMap(preset => preset.tags)
        return [...new Set(allTags)]
      },

      clearAll: () => {
        if (confirm('모든 프리셋을 삭제하시겠습니까?')) {
          set({ presets: [] })
        }
      },

      exportPresets: () => {
        return JSON.stringify(get().presets, null, 2)
      },

      importPresets: (data) => {
        try {
          const imported = JSON.parse(data) as PanPreset[]
          set(state => ({
            presets: [...imported, ...state.presets]
          }))
        } catch (error) {
          console.error('프리셋 가져오기 실패:', error)
          alert('잘못된 데이터 형식입니다.')
        }
      }
    }),
    {
      name: 'pan-presets-storage',
      version: 1
    }
  )
)
