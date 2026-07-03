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
  productType: 'bread' | 'pastry'  // 🆕 제품 타입 (제빵/제과)
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
  addPreset: (name: string, pans: PanConfig[], productType: 'bread' | 'pastry', notes?: string) => void
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
  getPresetsByProductType: (productType: 'bread' | 'pastry') => PanPreset[]  // 🆕 제품 타입별 필터링

  // 태그 관리
  addTag: (id: string, tag: string) => void
  removeTag: (id: string, tag: string) => void
  getAllTags: () => string[]

  // 데이터 관리
  clearAll: () => void
  exportPresets: () => string
  // 성공 여부를 반환(검증 실패 시 false). 실패 알림(alert 등)은 호출 컴포넌트가 담당.
  importPresets: (data: string) => boolean
}

export const usePanPresetStore = create<PanPresetStore>()(
  persist(
    (set, get) => ({
      presets: [],

      addPreset: (name, pans, productType, notes) => {
        const newPreset: PanPreset = {
          id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          productType,  // 🆕 제품 타입 저장
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
            preset.productType,  // 🆕 제품 타입 유지
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
        // persist 복원/외부 import 후 updatedAt이 문자열일 수 있어 방어적 변환
        return [...get().presets]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
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

      getPresetsByProductType: (productType) => {
        return get().presets.filter(preset => preset.productType === productType)
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
        // 확인 다이얼로그(confirm)는 UI 계층의 책임으로 위임한다.
        // 상태 계층(스토어)은 부작용 없이 상태만 변경한다.
        set({ presets: [] })
      },

      exportPresets: () => {
        return JSON.stringify(get().presets, null, 2)
      },

      importPresets: (data) => {
        try {
          const parsed = JSON.parse(data)
          // 스키마 검증: 최상위가 배열이어야 함
          if (!Array.isArray(parsed)) {
            console.error('프리셋 가져오기 실패: 최상위가 배열이 아닙니다.')
            return false
          }
          // 필수 필드(id/name/pans)를 갖춘 항목만 통과시키고, 나머지 필드는 안전하게 정규화한다.
          const normalized: PanPreset[] = parsed
            .filter(
              (p): p is PanPreset =>
                !!p &&
                typeof p === 'object' &&
                typeof p.id === 'string' &&
                typeof p.name === 'string' &&
                Array.isArray(p.pans)
            )
            .map((preset) => ({
              ...preset,
              productType: preset.productType === 'pastry' ? 'pastry' : 'bread',
              tags: Array.isArray(preset.tags) ? preset.tags : [],
              usageCount: typeof preset.usageCount === 'number' ? preset.usageCount : 0,
              isFavorite: Boolean(preset.isFavorite),
              // 외부 JSON의 날짜 필드는 문자열이므로 Date로 정규화 (getTime 크래시 방지)
              createdAt: preset.createdAt ? new Date(preset.createdAt) : new Date(),
              updatedAt: preset.updatedAt ? new Date(preset.updatedAt) : new Date(),
            }))
          set((state) => ({
            presets: [...normalized, ...state.presets]
          }))
          return true
        } catch (error) {
          console.error('프리셋 가져오기 실패:', error)
          return false
        }
      }
    }),
    {
      name: 'pan-presets-storage',
      version: 1,
      // persist 복원 시 날짜 필드(createdAt/updatedAt)가 문자열로 역직렬화되므로
      // Date로 정규화하여 이후 .getTime() 등 날짜 연산 크래시를 방지
      onRehydrateStorage: () => (state) => {
        if (state?.presets) {
          state.presets = state.presets.map(preset => ({
            ...preset,
            createdAt: new Date(preset.createdAt),
            updatedAt: new Date(preset.updatedAt)
          }))
        }
      }
    }
  )
)
