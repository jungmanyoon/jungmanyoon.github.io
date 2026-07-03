/**
 * Zustand 스토어 중앙 관리
 * 모든 스토어를 한 곳에서 export
 */

// 로컬 스코프 바인딩(초기화/리셋 함수에서 사용). re-export만으로는 이 모듈에
// 바인딩이 생기지 않아 아래 함수들이 런타임 ReferenceError로 크래시한다.
import { useAppStore } from './useAppStore'
import { useRecipeStore } from './useRecipeStore'
import { useCalculatorStore } from './useCalculatorStore'
import { useSettingsStore } from './useSettingsStore'
import { useDashboardStore } from './useDashboardStore'
import { usePanPresetStore } from './usePanPresetStore'
import { useWorkspaceStore } from './useWorkspaceStore'
import { useLocaleStore } from './useLocaleStore'

export { useAppStore, selectFavoriteHistory, selectRecentHistory, selectHistoryByType } from './useAppStore'
export { useRecipeStore, selectFilteredRecipes } from './useRecipeStore'
export { useCalculatorStore } from './useCalculatorStore'

// 글로벌 스토어 초기화 함수
export const initializeStores = async () => {
  // getState 호출로 각 스토어의 lazy 생성/persist 복원을 트리거
  useAppStore.getState()
  useRecipeStore.getState()
  useCalculatorStore.getState()
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
  // 이전엔 아래 5개 스토어가 누락되어 "전체 리셋" 계약을 지키지 못했다.
  // 각 스토어가 제공하는 안전한 초기화 액션을 호출한다.
  useSettingsStore.getState().resetAllSettings()      // 팬/제법/환경/재료 등 설정 기본값 복원
  useDashboardStore.getState().clearSourceRecipe()    // 변환 워크플로우 초기 상태로
  usePanPresetStore.getState().clearAll()             // 저장된 팬 프리셋 비움
  useWorkspaceStore.getState().selectRecipe(null)     // 워크스페이스 선택/계산 초기화
  useLocaleStore.getState().resetToDefaults()         // 언어/단위 설정 기본값 복원
}
