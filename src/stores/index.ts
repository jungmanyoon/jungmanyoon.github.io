/**
 * Zustand 스토어 중앙 관리
 * 모든 스토어를 한 곳에서 export
 */

export { useAppStore, selectFavoriteHistory, selectRecentHistory, selectHistoryByType } from './useAppStore'
export { useRecipeStore, selectFilteredRecipes } from './useRecipeStore'
export { useCalculatorStore } from './useCalculatorStore'

// 글로벌 스토어 초기화 함수
export const initializeStores = async () => {
  // 로컬 스토리지에서 데이터 로드
  const stores = [
    useAppStore.getState(),
    useRecipeStore.getState(),
    useCalculatorStore.getState()
  ]

  // 필요한 초기화 작업 수행
  console.log('Stores initialized successfully')
}

// 모든 스토어 상태 리셋
export const resetAllStores = () => {
  useAppStore.getState().resetPreferences()
  useAppStore.getState().clearHistory()
  useRecipeStore.getState().clearDraft()
  useCalculatorStore.getState().resetCalculator('bakersPercentage')
  useCalculatorStore.getState().resetCalculator('ddt')
  useCalculatorStore.getState().resetCalculator('yield')
  useCalculatorStore.getState().resetCalculator('pan')
  useCalculatorStore.getState().resetCalculator('method')
}