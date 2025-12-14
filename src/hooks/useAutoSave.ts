/**
 * 자동 저장 훅
 * 레시피와 설정 변경 시 로컬 폴더에 자동 저장
 */

import { useEffect, useRef, useCallback } from 'react'
import { useRecipeStore } from '@/stores/useRecipeStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { fileSystemStorage } from '@/utils/storage/fileSystemStorage'

// 디바운스 시간 (ms)
const DEBOUNCE_DELAY = 2000

export function useAutoSave() {
  const recipes = useRecipeStore(state => state.recipes)
  const { storage, pan, product, yieldLoss, method, environment, ingredient, advanced, updateLastSaved } = useSettingsStore()

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false)
  const lastRecipesRef = useRef<string>('')
  const lastSettingsRef = useRef<string>('')

  // 설정 데이터 직렬화
  const getSettingsJson = useCallback(() => {
    return JSON.stringify({ pan, product, yieldLoss, method, environment, ingredient, advanced })
  }, [pan, product, yieldLoss, method, environment, ingredient, advanced])

  // 레시피 데이터 직렬화
  const getRecipesJson = useCallback(() => {
    return JSON.stringify(recipes)
  }, [recipes])

  // 실제 저장 수행
  const performSave = useCallback(async () => {
    // 파일시스템 모드이고 자동저장이 켜져있을 때만
    if (storage.type !== 'filesystem' || !storage.autoSave) {
      return
    }

    // 파일시스템이 초기화되지 않았으면 초기화 시도
    if (!fileSystemStorage.isDirectorySelected()) {
      const initialized = await fileSystemStorage.initialize()
      if (!initialized) {
        return // 초기화 실패 시 저장하지 않음
      }
    }

    const currentRecipesJson = getRecipesJson()
    const currentSettingsJson = getSettingsJson()

    // 변경사항이 있을 때만 저장
    const recipesChanged = currentRecipesJson !== lastRecipesRef.current
    const settingsChanged = currentSettingsJson !== lastSettingsRef.current

    if (!recipesChanged && !settingsChanged) {
      return
    }

    try {
      if (recipesChanged) {
        await fileSystemStorage.writeFile('RECIPES', recipes)
        lastRecipesRef.current = currentRecipesJson
        console.log('[AutoSave] 레시피 저장 완료')
      }

      if (settingsChanged) {
        const settingsData = { pan, product, yieldLoss, method, environment, ingredient, advanced }
        await fileSystemStorage.writeFile('SETTINGS', settingsData)
        lastSettingsRef.current = currentSettingsJson
        console.log('[AutoSave] 설정 저장 완료')
      }

      updateLastSaved()
    } catch (error) {
      console.error('[AutoSave] 저장 실패:', error)
    }
  }, [storage, recipes, pan, product, yieldLoss, method, environment, ingredient, advanced, getRecipesJson, getSettingsJson, updateLastSaved])

  // 디바운스된 저장
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      performSave()
    }, DEBOUNCE_DELAY)
  }, [performSave])

  // 초기 로딩 (폴더 연결 시 자동으로 데이터 불러오기)
  useEffect(() => {
    const initializeFromStorage = async () => {
      if (storage.type !== 'filesystem' || isInitializedRef.current) {
        return
      }

      const initialized = await fileSystemStorage.initialize()
      if (initialized) {
        // 현재 값을 ref에 저장 (초기값은 저장하지 않도록)
        lastRecipesRef.current = getRecipesJson()
        lastSettingsRef.current = getSettingsJson()
        isInitializedRef.current = true
        console.log('[AutoSave] 초기화 완료')
      }
    }

    initializeFromStorage()
  }, [storage.type, getRecipesJson, getSettingsJson])

  // 레시피 또는 설정 변경 감지
  useEffect(() => {
    // 초기화 전에는 저장하지 않음
    if (!isInitializedRef.current && storage.type === 'filesystem') {
      return
    }

    debouncedSave()

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [recipes, pan, product, yieldLoss, method, environment, ingredient, advanced, debouncedSave, storage.type])

  // 컴포넌트 언마운트 시 즉시 저장
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        // 동기적으로 저장할 수 없으므로, 비동기 저장 시도
        performSave()
      }
    }
  }, [performSave])
}
