/**
 * useWorkspaceStore.ts
 *
 * 통합 워크스페이스 상태 관리
 * - 레시피 선택 및 실시간 계산
 * - 팬/제법 변경 시 즉시 재계산
 * - 퍼센트 모드 전환
 */

import { create } from 'zustand'
import type { Recipe, Ingredient, PanConfig, ProcessStep } from '@/types/recipe.types'

export type CalculationMode = 'bakers' | 'weight' | 'recipe'
export type MethodType = 'straight' | 'sponge' | 'poolish' | 'biga' | 'overnight'

interface WorkspaceState {
  // 선택 상태
  selectedRecipeId: string | null
  selectedPanConfig: PanConfig | null
  selectedMethod: MethodType
  calculationMode: CalculationMode
  batchMultiplier: number

  // 계산된 데이터 (실시간)
  calculatedIngredients: Ingredient[]
  originalIngredients: Ingredient[]
  totalDoughWeight: number
  scaleFactor: number

  // 액션
  selectRecipe: (recipe: Recipe | null) => void
  changePan: (pan: PanConfig) => void
  changeMethod: (method: MethodType) => void
  setCalculationMode: (mode: CalculationMode) => void
  setBatchMultiplier: (multiplier: number) => void
  resetCalculations: () => void
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  // 초기 상태
  selectedRecipeId: null,
  selectedPanConfig: null,
  selectedMethod: 'straight',
  calculationMode: 'bakers',
  batchMultiplier: 1,
  calculatedIngredients: [],
  originalIngredients: [],
  totalDoughWeight: 0,
  scaleFactor: 1,

  // 레시피 선택
  selectRecipe: (recipe) => {
    if (!recipe) {
      set({
        selectedRecipeId: null,
        calculatedIngredients: [],
        originalIngredients: [],
        totalDoughWeight: 0,
        scaleFactor: 1,
        selectedPanConfig: null,
      })
      return
    }

    set({
      selectedRecipeId: recipe.id,
      originalIngredients: recipe.ingredients || [],
      calculatedIngredients: recipe.ingredients || [],
      selectedPanConfig: recipe.panConfig || null,
      selectedMethod: recipe.method?.method || 'straight',
      totalDoughWeight: calculateTotalWeight(recipe.ingredients || []),
      scaleFactor: 1,
    })
  },

  // 팬 변경 → 즉시 재계산
  changePan: (newPan) => {
    const state = get()
    if (!state.selectedPanConfig || !state.originalIngredients.length) {
      set({ selectedPanConfig: newPan })
      return
    }

    // 팬 부피 기반 배율 계산
    const originalVolume = calculatePanVolume(state.selectedPanConfig)
    const newVolume = calculatePanVolume(newPan)
    const scaleFactor = newVolume / originalVolume

    // 모든 재료 재계산
    const scaledIngredients = scaleIngredients(
      state.originalIngredients,
      scaleFactor * state.batchMultiplier
    )

    set({
      selectedPanConfig: newPan,
      calculatedIngredients: scaledIngredients,
      scaleFactor,
      totalDoughWeight: calculateTotalWeight(scaledIngredients),
    })
  },

  // 제법 변경
  changeMethod: (method) => {
    set({ selectedMethod: method })
    // TODO: 제법 변환 로직 구현 (Phase 2)
  },

  // 퍼센트 모드 전환 (계산 없이 표시만 변경)
  setCalculationMode: (mode) => {
    set({ calculationMode: mode })
  },

  // 배수 변경 (2배, 3배 등)
  setBatchMultiplier: (multiplier) => {
    const state = get()
    if (!state.originalIngredients.length) return

    const totalScaleFactor = state.scaleFactor * multiplier
    const scaledIngredients = scaleIngredients(
      state.originalIngredients,
      totalScaleFactor
    )

    set({
      batchMultiplier: multiplier,
      calculatedIngredients: scaledIngredients,
      totalDoughWeight: calculateTotalWeight(scaledIngredients),
    })
  },

  // 초기화
  resetCalculations: () => {
    const state = get()
    set({
      calculatedIngredients: state.originalIngredients,
      batchMultiplier: 1,
      scaleFactor: 1,
      totalDoughWeight: calculateTotalWeight(state.originalIngredients),
    })
  },
}))

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 팬 부피 계산
 */
function calculatePanVolume(pan: PanConfig): number {
  if (!pan || !pan.dimensions) return 1000 // 기본값

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
      if (length && width && height) {
        // 식빵틀은 위가 더 넓음 (평균 사용)
        return length * width * height * 0.85
      }
      break
  }

  return 1000 // 기본값
}

/**
 * 재료 배율 적용
 */
function scaleIngredients(
  ingredients: Ingredient[],
  scaleFactor: number
): Ingredient[] {
  return ingredients.map((ingredient) => ({
    ...ingredient,
    amount: Math.round(ingredient.amount * scaleFactor * 10) / 10, // 소수점 1자리
  }))
}

/**
 * 총 반죽량 계산
 */
function calculateTotalWeight(ingredients: Ingredient[]): number {
  return Math.round(
    ingredients.reduce((sum, ing) => sum + (ing.amount || 0), 0)
  )
}

/**
 * 베이커스 퍼센트 계산
 */
export function calculateBakersPercentage(
  ingredients: Ingredient[]
): Ingredient[] {
  const flourWeight = ingredients
    .filter((i) => i.category === 'flour' || i.name?.includes('밀가루') || i.name?.includes('강력분'))
    .reduce((sum, i) => sum + (i.amount || 0), 0)

  if (flourWeight === 0) return ingredients

  return ingredients.map((ing) => ({
    ...ing,
    bakersPercentage: Math.round(((ing.amount || 0) / flourWeight) * 1000) / 10,
  }))
}

/**
 * 중량 퍼센트 계산
 */
export function calculateWeightPercentage(
  ingredients: Ingredient[]
): Ingredient[] {
  const totalWeight = ingredients.reduce((sum, i) => sum + (i.amount || 0), 0)

  if (totalWeight === 0) return ingredients

  return ingredients.map((ing) => ({
    ...ing,
    weightPercentage: Math.round(((ing.amount || 0) / totalWeight) * 1000) / 10,
  }))
}
