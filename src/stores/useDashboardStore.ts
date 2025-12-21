/**
 * 통합 대시보드 스토어
 * 레시피 변환 워크플로우 상태 관리 + 실시간 미리보기
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Recipe, Ingredient, PanConfig, BreadMethod } from '@/types/recipe.types'
import type {
  DashboardState,
  DashboardActions,
  ConversionConfig,
  ConversionDiff,
  ConversionSummary,
  ConversionHistoryEntry,
  ActiveConversion,
} from '@/types/dashboard.types'

// 기본 변환 설정
const defaultConversionConfig: ConversionConfig = {
  targetPan: null,
  panScaleFactor: 1,
  targetMethod: null,
  methodOptions: {},
  batchMultiplier: 1,
  targetYield: null,
  ddtSettings: null,
  environment: null,
}

// 초기 상태
const initialState: DashboardState = {
  sourceRecipeId: null,
  sourceRecipe: null,
  conversionConfig: defaultConversionConfig,
  convertedRecipe: null,
  conversionDiffs: [],
  conversionSummary: null,
  selectorPanelState: 'expanded',
  toolsPanelState: 'expanded',
  history: [],
  historyIndex: -1,
  isPreviewEnabled: true,
  previewDebounceMs: 300,
  isCalculating: false,
  lastCalculatedAt: null,
  activeToolTab: 'pan',
}

type DashboardStore = DashboardState & DashboardActions

export const useDashboardStore = create<DashboardStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ===== 레시피 선택 =====
        selectSourceRecipe: (recipe) => {
          if (!recipe) {
            get().clearSourceRecipe()
            return
          }

          set({
            sourceRecipeId: recipe.id,
            sourceRecipe: recipe,
            conversionConfig: {
              ...defaultConversionConfig,
              targetPan: recipe.panConfig || null,
            },
            convertedRecipe: { ...recipe },
            conversionDiffs: [],
            conversionSummary: createInitialSummary(recipe),
            history: [],
            historyIndex: -1,
          })
        },

        clearSourceRecipe: () => {
          set({
            sourceRecipeId: null,
            sourceRecipe: null,
            conversionConfig: defaultConversionConfig,
            convertedRecipe: null,
            conversionDiffs: [],
            conversionSummary: null,
            history: [],
            historyIndex: -1,
          })
        },

        // ===== 팬 변환 =====
        updatePanConfig: (pan) => {
          const state = get()
          if (!state.sourceRecipe) return

          const originalPan = state.sourceRecipe.panConfig
          const scaleFactor = calculatePanScaleFactor(originalPan, pan)

          const newConfig: ConversionConfig = {
            ...state.conversionConfig,
            targetPan: pan,
            panScaleFactor: scaleFactor,
          }

          pushToHistory(state, '팬 크기 변경', `Pan size changed`)
          set({ conversionConfig: newConfig })
          get().recalculate()
        },

        // ===== 제법 변환 =====
        updateMethodConfig: (method, options) => {
          const state = get()
          if (!state.sourceRecipe) return

          const newConfig: ConversionConfig = {
            ...state.conversionConfig,
            targetMethod: method,
            methodOptions: options || {},
          }

          pushToHistory(state, `제법 변경: ${getMethodNameKo(method)}`, `Method: ${method}`)
          set({ conversionConfig: newConfig })
          get().recalculate()
        },

        // ===== 수량 변환 =====
        updateQuantity: (multiplier) => {
          const state = get()
          if (!state.sourceRecipe) return

          const newConfig: ConversionConfig = {
            ...state.conversionConfig,
            batchMultiplier: multiplier,
          }

          pushToHistory(state, `수량 ${multiplier}배`, `Quantity ×${multiplier}`)
          set({ conversionConfig: newConfig })
          get().recalculate()
        },

        updateTargetYield: (yield_) => {
          const state = get()
          if (!state.sourceRecipe) return

          const newConfig: ConversionConfig = {
            ...state.conversionConfig,
            targetYield: yield_,
          }

          pushToHistory(state, `목표 생산량 변경`, `Target yield changed`)
          set({ conversionConfig: newConfig })
          get().recalculate()
        },

        // ===== DDT 변환 =====
        updateDDT: (settings) => {
          const state = get()

          const newConfig: ConversionConfig = {
            ...state.conversionConfig,
            ddtSettings: settings,
          }

          set({ conversionConfig: newConfig })
          // DDT는 재료량에 영향 없음, 물 온도만 계산
        },

        // ===== 환경 조정 =====
        updateEnvironment: (config) => {
          const state = get()

          const newConfig: ConversionConfig = {
            ...state.conversionConfig,
            environment: config,
          }

          pushToHistory(state, `환경 조정`, `Environment adjusted`)
          set({ conversionConfig: newConfig })
          get().recalculate()
        },

        // ===== 복합 업데이트 =====
        applyConversionConfig: (config) => {
          const state = get()

          const newConfig: ConversionConfig = {
            ...state.conversionConfig,
            ...config,
          }

          pushToHistory(state, `복합 변환 적용`, `Multiple conversions applied`)
          set({ conversionConfig: newConfig })
          get().recalculate()
        },

        // ===== 히스토리 =====
        undo: () => {
          const state = get()
          if (state.historyIndex <= 0) return

          const newIndex = state.historyIndex - 1
          const entry = state.history[newIndex]

          set({
            conversionConfig: entry.config,
            historyIndex: newIndex,
          })
          get().recalculate()
        },

        redo: () => {
          const state = get()
          if (state.historyIndex >= state.history.length - 1) return

          const newIndex = state.historyIndex + 1
          const entry = state.history[newIndex]

          set({
            conversionConfig: entry.config,
            historyIndex: newIndex,
          })
          get().recalculate()
        },

        canUndo: () => get().historyIndex > 0,
        canRedo: () => get().historyIndex < get().history.length - 1,

        // ===== 결과 저장 =====
        saveAsNewRecipe: async (name) => {
          const state = get()
          if (!state.convertedRecipe) throw new Error('No converted recipe')

          const newRecipe: Recipe = {
            ...state.convertedRecipe,
            id: generateId(),
            name: name || `${state.convertedRecipe.name} (변환됨)`,
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          // 레시피 스토어에 추가 (외부에서 처리)
          return newRecipe.id
        },

        // ===== 패널 관리 =====
        toggleSelectorPanel: () => {
          set((state) => ({
            selectorPanelState:
              state.selectorPanelState === 'expanded' ? 'collapsed' : 'expanded',
          }))
        },

        toggleToolsPanel: () => {
          set((state) => ({
            toolsPanelState:
              state.toolsPanelState === 'expanded' ? 'collapsed' : 'expanded',
          }))
        },

        setActiveToolTab: (tab) => {
          set({ activeToolTab: tab })
        },

        // ===== 초기화 =====
        resetConversion: () => {
          const state = get()
          if (!state.sourceRecipe) return

          set({
            conversionConfig: {
              ...defaultConversionConfig,
              targetPan: state.sourceRecipe.panConfig || null,
            },
            convertedRecipe: { ...state.sourceRecipe },
            conversionDiffs: [],
            conversionSummary: createInitialSummary(state.sourceRecipe),
            history: [],
            historyIndex: -1,
          })
        },

        // ===== 실시간 계산 =====
        recalculate: () => {
          const state = get()
          if (!state.sourceRecipe) return

          set({ isCalculating: true })

          try {
            const { convertedRecipe, diffs, summary } = performConversion(
              state.sourceRecipe,
              state.conversionConfig
            )

            set({
              convertedRecipe,
              conversionDiffs: diffs,
              conversionSummary: summary,
              isCalculating: false,
              lastCalculatedAt: new Date(),
            })
          } catch (error) {
            console.error('Conversion error:', error)
            set({ isCalculating: false })
          }
        },
      }),
      {
        name: 'dashboard-store',
        version: 2,
        partialize: (state) => ({
          selectorPanelState: state.selectorPanelState,
          toolsPanelState: state.toolsPanelState,
          isPreviewEnabled: state.isPreviewEnabled,
          activeToolTab: state.activeToolTab,
          history: state.history,  // 변환 히스토리 저장 추가
        }),
        migrate: (persistedState: any, version: number) => {
          // v1 -> v2: history 저장 추가
          if (version === 0 || version === 1) {
            return {
              ...persistedState,
              selectorPanelState: persistedState.selectorPanelState || 'expanded',
              toolsPanelState: persistedState.toolsPanelState || 'expanded',
              isPreviewEnabled: persistedState.isPreviewEnabled !== undefined ? persistedState.isPreviewEnabled : true,
              activeToolTab: persistedState.activeToolTab || 'pan',
              history: persistedState.history || []
            }
          }
          return persistedState
        }
      }
    ),
    { name: 'DashboardStore' }
  )
)

// ===== 유틸리티 함수 =====

function generateId(): string {
  return `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function calculatePanScaleFactor(
  originalPan: PanConfig | null | undefined,
  targetPan: PanConfig
): number {
  if (!originalPan) return 1

  const originalVolume = calculatePanVolume(originalPan)
  const targetVolume = calculatePanVolume(targetPan)

  return targetVolume / originalVolume
}

function calculatePanVolume(pan: PanConfig): number {
  if (!pan?.dimensions) return 1000

  const { length, width, height, diameter } = pan.dimensions

  switch (pan.type) {
    case 'round':
      if (diameter && height) {
        const radius = diameter / 2
        return Math.PI * radius * radius * height
      }
      break
    case 'square':
    case 'rectangular':
      if (length && width && height) {
        return length * width * height
      }
      break
    case 'loaf':
    case 'pullman':
      if (length && width && height) {
        return length * width * height * 0.85
      }
      break
  }

  return pan.volume || 1000
}

function getMethodNameKo(method: BreadMethod): string {
  const names: Record<BreadMethod, string> = {
    straight: '스트레이트법',
    sponge: '중종법',
    poolish: '폴리쉬법',
    biga: '비가법',
    tangzhong: '탕종법',
    autolyse: '오토리즈',
    overnight: '저온숙성법',
    'no-time': '노타임법',
    sourdough: '사워도우',
  }
  return names[method] || method
}

function pushToHistory(state: DashboardState, labelKo: string, label: string) {
  const entry: ConversionHistoryEntry = {
    id: generateId(),
    timestamp: new Date(),
    config: { ...state.conversionConfig },
    label,
    labelKo,
  }

  const newHistory = state.history.slice(0, state.historyIndex + 1)
  newHistory.push(entry)

  // 최대 50개 히스토리 유지
  if (newHistory.length > 50) {
    newHistory.shift()
  }
}

function createInitialSummary(recipe: Recipe): ConversionSummary {
  const totalWeight = recipe.ingredients?.reduce((sum, ing) => sum + (ing.amount || 0), 0) || 0
  const hydration = calculateHydration(recipe.ingredients || [])

  return {
    totalOriginalWeight: totalWeight,
    totalConvertedWeight: totalWeight,
    scaleFactor: 1,
    hydrationOriginal: hydration,
    hydrationConverted: hydration,
    activeConversions: [],
    warnings: [],
  }
}

function calculateHydration(ingredients: Ingredient[]): number {
  const flourWeight = ingredients
    .filter((i) => i.category === 'flour' || i.isFlour)
    .reduce((sum, i) => sum + (i.amount || 0), 0)

  const liquidWeight = ingredients
    .filter((i) => i.category === 'liquid')
    .reduce((sum, i) => sum + (i.amount || 0), 0)

  if (flourWeight === 0) return 0
  return Math.round((liquidWeight / flourWeight) * 1000) / 10
}

function performConversion(
  sourceRecipe: Recipe,
  config: ConversionConfig
): {
  convertedRecipe: Recipe
  diffs: ConversionDiff[]
  summary: ConversionSummary
} {
  // 총 배율 계산
  const totalScaleFactor = config.panScaleFactor * config.batchMultiplier

  // 재료 변환
  const convertedIngredients = sourceRecipe.ingredients.map((ing) => ({
    ...ing,
    amount: Math.round(ing.amount * totalScaleFactor * 10) / 10,
  }))

  // 변환된 레시피 생성
  const convertedRecipe: Recipe = {
    ...sourceRecipe,
    ingredients: convertedIngredients,
    panConfig: config.targetPan || sourceRecipe.panConfig,
    method: config.targetMethod
      ? {
          ...sourceRecipe.method,
          method: config.targetMethod,
          prefermentRatio: config.methodOptions.prefermentRatio || sourceRecipe.method.prefermentRatio,
        }
      : sourceRecipe.method,
    yield: {
      ...sourceRecipe.yield,
      quantity: Math.round(sourceRecipe.yield.quantity * config.batchMultiplier),
    },
  }

  // 차이점 계산
  const diffs: ConversionDiff[] = sourceRecipe.ingredients.map((original, index) => {
    const converted = convertedIngredients[index]
    const percentChange = ((converted.amount - original.amount) / original.amount) * 100

    return {
      ingredientId: original.id,
      ingredientName: original.name,
      originalAmount: original.amount,
      convertedAmount: converted.amount,
      percentChange: Math.round(percentChange * 10) / 10,
      changeType:
        percentChange > 0.5
          ? 'increase'
          : percentChange < -0.5
          ? 'decrease'
          : 'unchanged',
      unit: original.unit as string,
    }
  })

  // 요약 생성
  const activeConversions: ActiveConversion[] = []

  if (config.panScaleFactor !== 1) {
    activeConversions.push({
      type: 'pan',
      label: `×${config.panScaleFactor.toFixed(2)}`,
      labelKo: `팬 ${config.panScaleFactor.toFixed(2)}배`,
      impact: `${Math.round((config.panScaleFactor - 1) * 100)}%`,
      icon: '🍳',
    })
  }

  if (config.batchMultiplier !== 1) {
    activeConversions.push({
      type: 'quantity',
      label: `×${config.batchMultiplier}`,
      labelKo: `${config.batchMultiplier}배`,
      impact: `${Math.round((config.batchMultiplier - 1) * 100)}%`,
      icon: '🔢',
    })
  }

  if (config.targetMethod && config.targetMethod !== sourceRecipe.method.method) {
    activeConversions.push({
      type: 'method',
      label: config.targetMethod,
      labelKo: getMethodNameKo(config.targetMethod),
      impact: 'Method changed',
      icon: '📊',
    })
  }

  const summary: ConversionSummary = {
    totalOriginalWeight: sourceRecipe.ingredients.reduce((sum, ing) => sum + (ing.amount || 0), 0),
    totalConvertedWeight: convertedIngredients.reduce((sum, ing) => sum + (ing.amount || 0), 0),
    scaleFactor: totalScaleFactor,
    hydrationOriginal: calculateHydration(sourceRecipe.ingredients),
    hydrationConverted: calculateHydration(convertedIngredients),
    activeConversions,
    warnings: [],
  }

  return { convertedRecipe, diffs, summary }
}

// ===== 선택자 =====
export const selectHasChanges = (state: DashboardStore): boolean => {
  return (
    state.conversionConfig.panScaleFactor !== 1 ||
    state.conversionConfig.batchMultiplier !== 1 ||
    state.conversionConfig.targetMethod !== null
  )
}

export const selectTotalScaleFactor = (state: DashboardStore): number => {
  return state.conversionConfig.panScaleFactor * state.conversionConfig.batchMultiplier
}
